// DETAILS PANEL

// Converts a canvas pixel coordinate to (var1,var2)
function convertCoords (x, y) {
  var var2 = (x-chartbox.left)/mapx*var2range + var2min;
  var2 = Math.max(var2, 0);
  var var1 = (chartbox.bottom-y)/mapy*var1range + var1min;
  pay = Math.max(var1, 0);
  return [var2, var1];
}

// Comparator to sort results of compareEngines
function comparator (a,b) {
  if (isNaN(a[1]) && isNaN(b[1])) {
    return 0;
  } else if (isNaN(a[1])) {
    return 1;
  } else if (isNaN(b[1])) {
    return -1;      
  } else {
    return a[1]-b[1];
  }
}

// Computes analysis and sorts for given payload, dv, minTWR and engines list
function compareEngines (payload, dv, minTWR, engines) {
  var optimal;
  var results = [];
  for (var i=0; i < engines.length; i++) {
    fulldetails = fullAnalysis(engines[i], payload, dv, minTWR, maxengines);
    results.push(fulldetails);
  }
  results.sort(comparator);
  return results;
}

// Outputs a nicely formatted string given a time in seconds 
function nicetime (time) {
  if (isNaN(time)) {
    return "&ndash;";
  } else {
    var years, days, hours, mins, secs;
    var buf = "";
    if (time >= 31557600) {
      years = Math.floor(time/31557600);
      time = time - years*31557600;
      buf += years + " yr ";
    }
    if (time >= 86400) {
      days = Math.floor(time/86400);
      time = time - days*86400;
      buf += days + " d ";        
    }
    if (time >= 3600) {
      hours = Math.floor(time/3600);
      time = time - hours*3600;
      buf += hours + " h ";        
    }
    if (time >= 60) {
      mins = Math.floor(time/60);
      time = time - mins*60;
      buf += mins + " m ";        
    }
    buf += Math.round(time) + " s";
    return buf;
  }
}

// Sets the fixed labels of the Details panel (after chart generation)
function setDetailsTitles() {

  var fixedvartext, var1text, var2text, pressuretext;

  if (fixedvarname == "Min TWR") {
    fixedvartext = "Min TWR: " + fixedvar + " (" + TWRref + ")";
    var1text = "Payload: ";
    var2text = "\u0394v: ";
  } else if (fixedvarname == "Payload") {
    fixedvartext = "Payload: " + fixedvar + " tonnes";
    var1text = "Min TWR: ";
    var2text = "\u0394v: ";    
  } else if (fixedvarname == "Delta-v") {
    fixedvartext = "\u0394v: " + fixedvar + " m/s";
    var1text = "Min TWR: ";
    var2text = "Payload: ";    
  }
  $('#lblDetailsFixedVar').text(fixedvartext);
  $('#lblDetailsVar1Name').text(var1text);
  $('#lblDetailsVar2Name').text(var2text);
  
  pressuretext = "Pressure: ";
  if (atmpres > 0) {
    if (["Kerbin","Duna","Eve","Laythe"].indexOf($('#atmpresetsmenu').val()) >= 0) {
      pressuretext += atmpres.toString() + " atm (" + $('#atmpresetsmenu').val() + ")";
    } else {
      pressuretext += atmpres.toString() + " atm";
    }      
  } else {
    pressuretext += "vacuum";
  }
  $('#lblDetailsPressure').text(pressuretext);
  
}

// Update details panel for given var2 (x), var1 (y)
function updateDetails (var2, var1) {

  var var1decs, var2decs, buf1, buf2;
  
  if (fixedvarname == "Min TWR") {
    var1decs = 2;
    var1unit = " t";
    var2decs = 0;
    var2unit = " m/s";
    payload = var1;
    dv = var2;
    minTWR = fixedvar;
  } else if (fixedvarname == "Payload") {
    var1decs = 3;
    var1unit = "";
    var2decs = 0;
    var2unit = " m/s";
    payload = fixedvar;
    dv = var2;
    minTWR = var1;    
  } else if (fixedvarname == "Delta-v") {
    var1decs = 3;
    var1unit = "";
    var2decs = 2;
    var2unit = " t";
    payload = var2;
    dv = fixedvar;
    minTWR = var1;     
  }
  $('#lblDetailsVar1Value').text(var1.toFixed(var1decs) + var1unit);
  $('#lblDetailsVar2Value').text(var2.toFixed(var2decs) + var2unit);
  
  results = compareEngines (payload, dv, minTWR, engines);
  
  if (isNaN(results[0][1])) {
    buf1 = "No solution";
    buf2 = "";
  } else {
    buf1 = "Best: " + results[0][0].fullname + " \u00D7 " + results[0][2];
    buf2 = results[0][1].toFixed(2) +  " t";
  }
  $('#lblBestEngine').text(buf1);
  $('#lblBestMass').text(buf2);
  $('#lblBestPayFrac').text((results[0][3]*100).toFixed(1)+"%");
  $('#lblBestBurnoutTime').text((results[0][7]).toFixed(1)+" s");
  $('#lblBestMinAccel').text((results[0][4]).toFixed(1));
  $('#lblBestAvgAccel').text((results[0][5]).toFixed(1));
  $('#lblBestMaxAccel').text((results[0][6]).toFixed(1));
  $('#lblBestPayMass').text(payload.toFixed(1));
  $('#lblBestPropMass').text((results[0][8]).toFixed(1));
  $('#lblBestTankMass').text((results[0][9]).toFixed(1));
  $('#lblBestEngMass').text((results[0][10]).toFixed(1));
  $('#lblBestBurnTime1').html(nicetime(results[0][11]));
  $('#lblBestBurnTime2').html(nicetime(results[0][12]));
  $('#lblBestBurnTime3').html(nicetime(results[0][13]));
  $('#lblBestBurnTime4').html(nicetime(results[0][14]));
  
  if (isNaN(results[1][1])) {
    buf1 = "No solution";
    buf2 = "";
  } else {
    buf1 = "Runner-up: " + results[1][0].fullname + " \u00D7 " + results[1][2];
    buf2 = results[1][1].toFixed(2) +  " t";
  }
  $('#lblRunnerupEngine').html(buf1);
  $('#lblRunnerupMass').html(buf2);
  $('#lblRunnerupPayFrac').text((results[1][3]*100).toFixed(1)+"%");
  $('#lblRunnerupBurnoutTime').text((results[1][7]).toFixed(1)+" s");
  $('#lblRunnerupMinAccel').text((results[1][4]).toFixed(1));
  $('#lblRunnerupAvgAccel').text((results[1][5]).toFixed(1));
  $('#lblRunnerupMaxAccel').text((results[1][6]).toFixed(1));
  $('#lblRunnerupPayMass').text(payload.toFixed(1));
  $('#lblRunnerupPropMass').text((results[1][8]).toFixed(1));
  $('#lblRunnerupTankMass').text((results[1][9]).toFixed(1));
  $('#lblRunnerupEngMass').text((results[1][10]).toFixed(1));
  $('#lblRunnerupBurnTime1').html(nicetime(results[1][11]));
  $('#lblRunnerupBurnTime2').html(nicetime(results[1][12]));
  $('#lblRunnerupBurnTime3').html(nicetime(results[1][13]));
  $('#lblRunnerupBurnTime4').html(nicetime(results[1][14]));

}

// Clears the details panel
function clearDetails () {

  var toClear = ["lblDetailsVar1Value", "lblDetailsVar2Value", "lblBestMass", "lblBestPayFrac", "lblBestBurnoutTime", "lblBestMinAccel", "lblBestAvgAccel", "lblBestMaxAccel", "lblBestPayMass", "lblBestPropMass", "lblBestTankMass", "lblBestEngMass", "lblBestBurnTime1", "lblBestBurnTime2", "lblBestBurnTime3", "lblBestBurnTime4", "lblRunnerupMass", "lblRunnerupPayFrac", "lblRunnerupBurnoutTime", "lblRunnerupMinAccel", "lblRunnerupAvgAccel", "lblRunnerupMaxAccel", "lblRunnerupPayMass", "lblRunnerupPropMass", "lblRunnerupTankMass", "lblRunnerupEngMass", "lblRunnerupBurnTime1", "lblRunnerupBurnTime2", "lblRunnerupBurnTime3", "lblRunnerupBurnTime4"];
  for (var i=0; i < toClear.length; i++) {
    $('#'+toClear[i]).html("&nbsp;");
  }
  $("#lblBestEngine").html("Best");
  $("#lblRunnerupEngine").html("Runner-up");

}
  
