// Calculations

// Number of engines needed to satisfy TWR restriction
function calc_numengines (engine, payload, dv, minTWR) {
  if (minTWR == 0) {
    return 1;
  } else {
    var A = engine.TWR/minTWR*((engine.alpha+1)*Math.exp(-dv/(engine.Isp*g0))-1);
    if (A > engine.alpha) {
      return Math.ceil((engine.alpha*payload/engine.mass)/(A-engine.alpha));
    } else {
      return NaN;
    }
  }
}

 // Maximum dv for a given minTWR
function calc_maxdv (engine, minTWR) {
  maxdv = engine.Isp*g0*Math.log((1.0+engine.alpha)/(1.0+engine.alpha*minTWR/engine.TWR));
  if (maxdv > 0) {
    return maxdv;
  } else  {
    return NaN;
  }
}

// Optimal mass for an engine, payload and dv combination, subject to 
// restrictions on the final TWR and the number of engines
// Returns the list [optimal mass, number of engines]
function calc_mass (engine, payload, dv, minTWR, maxengines) {
  if (dv > calc_maxdv (engine, minTWR)) {
    return [NaN, NaN];
  } else {
    numengines = calc_numengines (engine, payload, dv, minTWR);
    if (isNaN(numengines) || ((maxengines > 0) && (numengines > maxengines))) {
      return [NaN, NaN];
    } else {
      mass = (engine.alpha*(payload+numengines*engine.mass))/((engine.alpha+1)*Math.exp(-dv/(engine.Isp*g0))-1.0);
      return [mass, numengines];
    }
  }
}

// Computes the burntime for dv given the parameters
function burntime (totthrust, totmass, veff, maxdv, dv) {
  if (dv <= maxdv) return totmass/totthrust*veff*(1-Math.exp(-dv/veff));
  else return NaN;
}

// Calls calc_mass to obtain total mass and number of engines, but also
// computes other stuff like acceleration, burn times, etc.
function fullAnalysis (engine, payload, dv, minTWR, maxengines) {
  
  var result = calc_mass(engine, payload, dv, minTWR, maxengines);
  var totmass = result[0];
  var numengines = result[1];
  var payfrac = payload/totmass;
  var totthrust = numengines*engine.thrust;
  var engmass = numengines*engine.mass;
  var tankmass = (totmass-payload-engmass)/(engine.alpha+1)
  var propmass = engine.alpha*tankmass;
  var minaccel = totthrust/totmass;
  var maxaccel = totthrust/(totmass-propmass);
  var actualdv = engine.Isp*g0*Math.log(totmass/(totmass-propmass));
  var mdot = totthrust/(engine.Isp*g0);   // in t/s
  var burnouttime = propmass/mdot;
  var avgaccel = actualdv/burnouttime;
  var veff = engine.Isp*g0;
  var burntime100 = burntime(totthrust, totmass, veff, actualdv, 100);
  var burntime200 = burntime(totthrust, totmass, veff, actualdv, 200);
  var burntime500 = burntime(totthrust, totmass, veff, actualdv, 500);
  var burntime1000 = burntime(totthrust, totmass, veff, actualdv, 1000);
  return [engine, totmass, numengines, payfrac, minaccel, avgaccel, maxaccel, burnouttime, propmass, tankmass, engmass, burntime100, burntime200, burntime500, burntime1000];
  
}  

// Helper function to compute the terms that depend only on delta-v, not on payload
function calc_dvterms(engines, dv, minTWR) {
  var i;
  for (i = 0; i < engines.length; i++) {
    engines[i].dvterm = (engines[i].alpha + 1.0) * Math.exp(-dv/(engines[i].Isp*g0)) - 1.0;
  }
  if (minTWR > 0) {
    for (i = 0; i < engines.length; i++) {
      engines[i].nengterm = engines[i].TWR/minTWR*engines[i].dvterm;
    }
  }
}

// Helper function to find best engine for a given dv, minTWR and payload
// Assumes maxdv, nengterm and dvterm have already been computed
// Returns the Engine object of the best engine, or -1 is none found
function find_best(engines, dv, minTWR, payload, maxengines) {
  
  var i, totmass, best, minmass, numengines;
  var best = -1
  var minmass = 1e30;

  for (i = 0; i < engines.length; i++) {
    if (dv < engines[i].maxdv) {

      // Compute numengines
      if (minTWR == 0) {
        numengines = 1;
      } else if (engines[i].nengterm > engines[i].alpha) {
        numengines = Math.ceil((engines[i].alpha*payload/engines[i].mass)/(engines[i].nengterm-engines[i].alpha));
      } else {
        continue;
      }
      if ((maxengines > 0) && (numengines > maxengines)) continue;
      
      // Compute total mass
      totmass = engines[i].alpha * (payload + numengines*engines[i].mass) / engines[i].dvterm;
      if (isNaN(totmass)) continue;

      // Check if better than current
      if (totmass < minmass) {
        best = engines[i];
        minmass = totmass;
      }
      
    }
  }
  return best;

}

// Helper function to set the (x,y) pixel to the color of the best engine
function set_color_best(mapresult, best, x, y, nx) {
  var R, G, B, loc;
  if (best == -1) {
    R = 255;
    G = 255;
    B = 255;
  } else {
    R = best.color[0];
    G = best.color[1];
    B = best.color[2];
    best.show = true;
  }
  loc = 4 * (x + nx*y);
  mapresult.data[loc] = R;
  mapresult.data[loc+1] = G;
  mapresult.data[loc+2] = B;
  mapresult.data[loc+3] = 255;
}

// Computes the best engine for a grid of payload,dv values
// and returns an ImageData object with the results
// This makes the calculation faster since expensive computations are memoized
function calc_best_grid (nx, ny, engines, fixedvarname, fixedvar, var1min, var1max, var2min, var2max, maxengines) {

  console.log("calc_best_grid input:");
  console.log(fixedvarname, fixedvar, var1min, var1max, var2min, var2max);
  var mapresult, best, dv, payload;
  var x, y, i;
  
  var var1range = var1max - var1min;
  var var2range = var2max - var2min;
  console.log(var1range, var2range);

  // Reset engine 'show' flags
  for (i = 0; i < engines.length; i++) {
    engines[i].show = false;
  }

  // Create ImageData to store results
  mapresult = heatmap.createImageData(new Size(nx,ny));

  // Fixed = min TWR, x = delta-v, y = payload
  if (fixedvarname == "Min TWR") {
    
    minTWR = fixedvar;
    for (i = 0; i < engines.length; i++)
      engines[i].maxdv = calc_maxdv(engines[i], minTWR);
    
    for (x = 0; x < nx; x++) {
      
      dv = x/nx*var2range + var2min;
      calc_dvterms(engines, dv, minTWR)
      
      for (y = 0; y < ny; y++) {
        payload = (ny-y)/ny*var1range + var1min;      
     
        // Find optimal engine
        best = find_best(engines, dv, minTWR, payload, maxengines);
        
        // Color cell according to optimal engine
        set_color_best(mapresult, best, x, y, nx);
        
      }
    }
    
  // Fixed = payload, x = delta-v, y = min TWR    
  } else if (fixedvarname == "Payload") {
    
    payload = fixedvar;
   
    for (x = 0; x < nx; x++) {
      dv = x/nx*var2range + var2min;
      
      for (y = 0; y < ny; y++) {
        minTWR = (ny-y)/ny*var1range + var1min;    

        calc_dvterms(engines, dv, minTWR)
        for (i = 0; i < engines.length; i++)
          engines[i].maxdv = calc_maxdv(engines[i], minTWR);
     
        // Find optimal engine
        best = find_best(engines, dv, minTWR, payload, maxengines);
        
        // Color cell according to optimal engine
        set_color_best(mapresult, best, x, y, nx);
        
      }
    }    
  
  // Fixed = delta-v, x = payload, y = min TWR    
  } else if (fixedvarname == "Delta-v") {
    
    dv = fixedvar;
   
    for (y = 0; y < ny; y++) {
      minTWR = (ny-y)/ny*var1range + var1min;
      
      for (i = 0; i < engines.length; i++)
        engines[i].maxdv = calc_maxdv(engines[i], minTWR);   
      calc_dvterms(engines, dv, minTWR)   
      
      for (x = 0; x < nx; x++) {
        payload = x/nx*var2range + var2min;
     
        // Find optimal engine
        best = find_best(engines, dv, minTWR, payload, maxengines);
        
        // Color cell according to optimal engine
        set_color_best(mapresult, best, x, y, nx);
        
      }
    }
  
  }
  


  return mapresult;

}

