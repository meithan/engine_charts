// ENGINE CHART

// ==========================

// Mouse box interactions
  
// Fill details panel for point under mouse (if within mousebox bounds)
function mouseboxOnMouseMove (event) {

  if (!detailsLocked) {

    if (typeof engines != 'undefined' && chartbox.contains(event.point)) {
      var coords = convertCoords (event.point.x, event.point.y);
      updateDetails(coords[0], coords[1]);    
    } else {
      clearDetails();
    }

  }
  lastpos = event.point;
  
}

function mouseboxOnMouseEnter(event) {
 
}

function mouseboxOnMouseLeave(event) {

}
 
function mouseboxOnClick (event) {

}

// Update zoombox or panned view
function mouseboxOnMouseDrag (event) {

  hairlineH.visible = false;
  hairlineV.visible = false;
  detailsLocked = false;
  document.getElementById("lockedTooltip").style.visibility = "hidden";    

  if (!zoomStarted && !panStarted && chartbox.contains(event.point)) {

    if (event.modifiers.control) {
      zoombox = new Shape.Rectangle(event.point.x, event.point.y, 0, 0);
      zoombox.insertBelow(mousebox);
      zoomstart = new Point(event.point);      
      zoomStarted = true;
      console.log("zoombox started");
    } else {
      panstart = new Point(event.point);
      mapstart = heatmap.position;
      panStarted = true;
      console.log("pan started");        
    }

  }

  if (zoomStarted) {

    var x0 = Math.max(Math.min(event.point.x,zoomstart.x),chartbox.left);
    var y0 = Math.max(Math.min(event.point.y,zoomstart.y),chartbox.top);
    var x1 = Math.min(Math.max(event.point.x,zoomstart.x),chartbox.right);
    var y1 = Math.min(Math.max(event.point.y,zoomstart.y),chartbox.bottom);
    var dx = Math.abs(x0-x1);
    var dy = Math.abs(y0-y1);
    var newsize = new Size(dx,dy);
    var newpos = new Point(x0+dx/2,y0+dy/2);
    zoombox.set({
      strokeColor: 'black',
      dashArray: [5, 3],
      position: newpos,
      size: newsize
    });

  } else if (panStarted) {

    var dx = event.point.x - panstart.x;
    var dy = event.point.y - panstart.y;
    var dxmax = var2min/var2range*mapx;
    if (dx > dxmax) {
      dx = dxmax;
      panstart.x = event.point.x - dx;
    }
    var dymin = -var1min/var1range*mapy;
    if (dy < dymin) {
      dy = dymin;
      panstart.y = event.point.y - dy;
    }
    heatmap.position = new Point(mapstart.x+dx, mapstart.y+dy);

  }
  
}

// Freeze details
function mouseboxOnMouseUp (event) {
  
  if (chartbox.contains(event.point)) {
    if (detailsLocked) {
      hairlineH.visible = false;
      hairlineV.visible = false;
      detailsLocked = false;
      document.getElementById("lockedTooltip").style.visibility = "hidden";
    } else {
      hairlineH = new Path.Line(new Point(chartbox.left,event.point.y), new Point(chartbox.right,event.point.y));
      hairlineH.strokeColor = "black";
      hairlineH.strokeWidth = 1;
      hairlineV = new Path.Line(new Point(event.point.x,chartbox.top), new Point(event.point.x,chartbox.bottom));
      hairlineV.strokeColor = "black";
      hairlineV.strokeWidth = 1;
      detailsLocked = true;
      document.getElementById("lockedTooltip").style.visibility = "visible";        
    }
  }

}

// Adds a mouseup listener to the whole document to execute
// mouse interaction even outside the canvas
document.addEventListener("mouseup", function(){
  if (zoomStarted) executeZoombox(lastpos);
  else if (panStarted) executePanview();     
});


// Executes the zoombox zoom
function executeZoombox (point) {
  var x1 = Math.min(point.x, zoomstart.x);
  var y1 = Math.max(point.y, zoomstart.y);
  var x2 = Math.max(point.x, zoomstart.x);
  var y2 = Math.min(point.y, zoomstart.y);
  var newmin = convertCoords(x1, y1);
  var newmax = convertCoords(x2, y2);
  console.log("new var1 range:", newmin[1], newmax[1]);
  console.log("new var2 range:", newmin[0], newmax[0]);
  setRanges(newmin[1], newmax[1], newmin[0], newmax[0]);
  storeSettings();
  plot_chart();
  zoombox.remove();
  zoombox = null
  zoomStarted = false;
  detailsLocked = false;
  document.getElementById("lockedTooltip").style.visibility = "hidden";    
}

// Executes the view panning
function executePanview () {
  var dx = heatmap.position.x-mapstart.x;
  var dy = heatmap.position.y-mapstart.y;
  var newvar1min = Math.max(var1min+dy/mapy*var1range, 0);
  var newvar1max = var1max+dy/mapy*var1range;
  var newvar2min = Math.max(var2min-dx/mapx*var2range, 0);
  var newvar2max = var2max-dx/mapx*var2range;        
  console.log("new var1 range:", newvar1min, newvar1max);
  console.log("new var2 range:", newvar2min, newvar2max);
  setRanges(newvar1min, newvar1max, newvar2min, newvar2max);
  storeSettings();
  plot_chart();
  panStarted = false;
  detailsLocked = false;
  document.getElementById("lockedTooltip").style.visibility = "hidden";
}

/*==============================================*/ 

// Settings recall

// Insert settings at current idx, removing those after it
function storeSettings() {
  recallCache = recallCache.slice(0,recallIdx+1);
  recallCache.push([var1min,var1max,var2min,var2max]);
  recallIdx += 1;
  updateRecallBtns();
}

function updateRecallBtns () {
 if (recallCache.length > 1) {
    if (recallIdx == recallCache.length-1) {
      $('#recallBack').prop('disabled', false);
      $('#recallForward').prop('disabled', true);
    } else if (recallIdx == 0) {
      $('#recallBack').prop('disabled', true);
      $('#recallForward').prop('disabled', false);      
    } else {
      $('#recallBack').prop('disabled', false);
      $('#recallForward').prop('disabled', false);      
    }
  } else {
    $('#recallBack').prop('disabled', true);
    $('#recallForward').prop('disabled', true); 
  }
}

// Recall previous ranges
function recallSettings(direction) {

  var newIdx = recallIdx + direction;
  if (newIdx >= 0 && newIdx < recallCache.length) {
    setRanges(recallCache[newIdx][0], recallCache[newIdx][1], recallCache[newIdx][2], recallCache[newIdx][3]);
    plot_chart();
    recallIdx = newIdx;
    updateRecallBtns();
  }

}

/*==============================================*/ 

// Zoom buttons

function zoomAction(direction, variable) {

  if (direction == "in") zoomfactor = 0.5;
  else if (direction == "out") zoomfactor = 2.0;

  if (variable == "var1") {
    var newvar1range = var1range*zoomfactor;
    var newvar1min = (var1min+var1max)/2 - var1range/2;
    newvar1min = Math.max(0,newvar1min);
    var newvar1max = newvar1min + newvar1range;
    setRanges(newvar1min, newvar1max, var2min, var2max);
  } else if (variable == "var2") {
    var newvar2range = var2range*zoomfactor;
    var newvar2min = (var2min+var2max)/2 - newvar2range/2;
    newvar2min = Math.max(0,newvar2min);
    var newvar2max = newvar2min + newvar2range;
    setRanges(var1min, var1max, newvar2min, newvar2max);
  }
  storeSettings();
  plot_chart();

}

/*==============================================*/ 

// Save image
function saveCanvas() {
  document.getElementById("downloader").download = "chart.png";
  document.getElementById("downloader").href = document.getElementById("myCanvas").toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  console.log(document.getElementById("myCanvas").toDataURL("image/png"));
}

/*==============================================*/

// Plots the color key
function plot_color_key () {

  // Clear current color key and set it to be the active layer
  colorkeyLayer.removeChildren();
  colorkeyLayer.activate();
  
  var toshow = [];
  for (var i=0; i < engines.length; i++) {
    if (engines[i].show) toshow.push(engines[i]);
  }
  keywidth = 30;
  keyheight = keywidth*toshow.length;
  var originx = chartbox.right+15;
  var originy = chartbox.top;
  var keytopleft = new Point(originx, originy);
  for (var i=0; i < toshow.length; i++) {
  
    var keyelem = new Path.Rectangle(new Rectangle(new Point(originx,originy+i*keywidth), keywidth, keywidth));
    //keyelem.strokeColor = "black";
    c = toshow[i].color;
    keyelem.fillColor = new Color(c[0]/255,c[1]/255,c[2]/255);
    
    var label = new PointText({
    point: [originx+keywidth*1.3, originy+i*keywidth+fontSize*1.2],
    justification: 'left',
    fillColor: 'black',
    content: toshow[i].fullname,
    fontSize: fontSize-3
    });
    //content: useoldnames ? toshow[i].name : toshow[i].nickname,
    
  }
  var keybox = new Path.Rectangle(new Rectangle(keytopleft, keywidth, keyheight));
  keybox.strokeColor = "black";

}

/*==============================================*/  

// Plots the engine chart
function plot_chart () {

  var i, x, y, num_ints;
  var var1, var1breaks, var1step, var1label, group1Name;
  var var2, var2breaks, var2step, var2label, group2Name;

  //tic = performance.now();   // not supported by Safari
  tic = Date.now();

  console.log("Fixed var (" + fixedvarname + ") = " + fixedvar);
  console.log("Var1 (" + var1name + ") range: " + var1min + " - " + var1max);
  console.log("Var2 (" + var2name + ") range: " + var2min + " - " + var2max);
  console.log("TWR reference: " + TWRref);
  console.log("Atmospheric pressure: " + atmpres + " atm");
  console.log("Maximum engines: " + maxengines);
  console.log(engines.length + " engines selected:");
  console.log(engines);

  // Number of grid points
  quality = $("input[type='radio'][name='quality']:checked").val();
  if (quality == "high") {
    nx = 500;
    ny = 500;
    scaling = 1.0;
  } else {
    nx = 200;
    ny = 200;
    scaling = 2.5;
  }

  // Clear chart layer and activate it
  chartLayer.removeChildren();
  chartLayer.activate();
        
  // Re-add chart box
  project.activeLayer.addChild(chartboxPath);
  
  toc = Date.now();
  console.log("Initializations: " + ((toc-tic)>=1 ? (toc-tic) : "< 1") + " ms");
  tic = Date.now();

  // Select tick step breakpoints and axis labels
  dvbreaks = [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10];
  paybreaks =  [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];
  twrbreaks = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
  dvlabel = '\u0394v [m/s]';
  twrlabel = 'Minimum ' + TWRref + ' TWR';
  paylabel = 'Payload mass [tonnes]';
  if (fixedvarname == "Payload") {
    var2breaks = dvbreaks;
    var2label = dvlabel;
    var1breaks = twrbreaks;
    var1label = twrlabel;
  } else if (fixedvarname == "Min TWR") {
    var2breaks = dvbreaks;
    var2label = dvlabel;
    var1breaks = paybreaks;
    var1label = paylabel;
  } else if (fixedvarname == "Delta-v") {
    var2breaks = paybreaks;
    var2label = paylabel;
    var1breaks = twrbreaks;
    var1label = twrlabel;
  } else {
    console.log("ERROR: bad fixed var ", fixedvarname);
    return;
  }
  
  // Compute x tick positions so there are between 4 and 9 intervals
  for (i=0; i < var2breaks.length; i++) {
    num_ints = var2range/var2breaks[i];
    if ((num_ints >= 4) && (num_ints <= 9)) {
      var2step = var2breaks[i];
      break;
    }
  }

  // Create x ticks and gridlines
  var2 = Math.floor((var2min+var2step)/var2step)*var2step;
  if ((var2-var2min) < var2step/3.0) var2 = var2 + var2step;    
  while (var2max-var2 >= var2step/3.0) {
    x = chartbox.left + (var2-var2min)/(var2range)*mapx;
    var tick = tickSymbol.place()
    tick.position = new Point(x, chartbox.bottom-ticklength/2);
    var tick = tickSymbol.place()
    tick.position = new Point(x, chartbox.top+ticklength/2);
    var gridline = gridlineSymbol.place()
    gridline.position = new Point(x, chartbox.center.y);
    var ticklabel = new PointText({
      point: [x, chartbox.bottom+tickLabelPad],
      content: var2.toFixed(var2decs),
      fontSize: fontSize,
      justification: 'center'
    });
    var2 += var2step;
  }
  var ticklabel = new PointText({
    point: [chartbox.left, chartbox.bottom+tickLabelPad],
    content: var2min.toFixed(var2decs),
    fontSize: fontSize,
    justification: 'center'
  });
  var ticklabel = new PointText({
    point: [chartbox.right, chartbox.bottom+tickLabelPad],
    content: var2max.toFixed(var2decs),
    fontSize: fontSize,
    justification: 'center'
  });

  // Compute y tick positions so there are between 4 and 8 intervals
  for (i=0; i < var1breaks.length; i++) {
    num_ints = var1range/var1breaks[i];
    if ((num_ints >= 4) && (num_ints <= 8)) {
      var1step = var1breaks[i];
      break;
    }
  }
  
  // Create y ticks and gridlines
  var var1 = Math.floor((var1min+var1step)/var1step)*var1step;
  if ((var1-var1min) < var1step/4.0) var1 = var1 + var1step;
  while (var1max-var1 >= var1step/4.0) {
    y = chartbox.bottom - (var1-var1min)/(var1range)*mapy;
    var tick = tickSymbol.place()
    tick.rotate(90);
    tick.position = new Point(chartbox.left+ticklength/2, y);
    var tick = tickSymbol.place()
    tick.rotate(90);
    tick.position = new Point(chartbox.right-ticklength/2, y);
    var gridline = gridlineSymbol.place()
    gridline.rotate(90);
    gridline.position = new Point(chartbox.center.x, y);
    var ticklabel = new PointText({
      point: [chartbox.left-tickLabelPad/3, y+fontSize/3],
      content: var1.toFixed(var1decs),
      fontSize: fontSize,
      justification: 'right'
    });
    var1 += var1step;
  }
  var ticklabel = new PointText({
    point: [chartbox.left-tickLabelPad/3, chartbox.top+fontSize/3],
    content: var1max.toFixed(var1decs),
    fontSize: fontSize,
    justification: 'right'
  });
  var ticklabel = new PointText({
    point: [chartbox.left-tickLabelPad/3, chartbox.bottom+fontSize/3],
    content: var1min.toFixed(var1decs),
    fontSize: fontSize,
    justification: 'right'
  });    

  // x-axis label
  var xlabel = new PointText({
    point: [chartbox.center.x, chartbox.bottom+tickLabelPad+2*fontSize],
    justification: 'center',
    fillColor: 'black',
    content: var2label,
    fontSize: fontSize+2
  });
  
  // y-axis label
  var ylabel = new PointText({
    point: [chartbox.left-tickLabelPad*2.7, chartbox.center.y],
    justification: 'center',
    fillColor: 'black',
    content: var1label,
    fontSize: fontSize+2,
  });
  ylabel.rotate(-90);
  
  // Create chart title
  var titletext;
  if (fixedvarname == "Min TWR")
    titletext = "Minimum " + TWRref + " TWR = " + fixedvar.toString();
  else if (fixedvarname == "Payload")
    titletext = "Payload = " + fixedvar.toString() + " tonnes";
  else if (fixedvarname == "Delta-v")
    titletext = "\u0394v = " + fixedvar.toString() + " m/s";

  titletext += " @ ";
  if (atmpres > 0) {
    if (["Kerbin","Duna","Eve","Laythe"].indexOf($('#atmpresetsmenu').val()) >= 0) {
      titletext += atmpres.toString() + " atm (" + $('#atmpresetsmenu').val() + ")";
    } else {
      titletext += atmpres.toString() + " atm";
    }
  } else {
    titletext += "vacuum";
  }
  var title = new PointText({
    point: [chartbox.center.x, chartbox.top-tickLabelPad],
    justification: 'center',
    fillColor: 'black',
    content: titletext,
    fontSize: fontSize+2
  });
  
  toc = Date.now();
  console.log("Axes creation: " + ((toc-tic)>=1 ? (toc-tic) : "< 1") + " ms");
  tic = Date.now();

  // Initialize heatmap
  heatmap = new Raster();
  heatmap.position = new Point(chartbox.center.x, chartbox.center.y);
  heatmap.size = new Size(nx,ny);

  // Compute the map
  mapdata = calc_best_grid(nx, ny, engines, fixedvarname, fixedvar, var1min, var1max, var2min, var2max, maxengines);

  toc = Date.now();
  console.log("Chart computation: " + ((toc-tic)>=1 ? (toc-tic) : "< 1") + " ms");
  tic = Date.now();

  // Set data to heatmap and send to back
  heatmap.setImageData(mapdata, new Point(0,0));
  heatmap.sendToBack();
  
  // Scale to 500x500 resolution, if needed
  scalecenter = new Point(chartbox.center.x, chartbox.center.y);
  heatmap.scale(scaling, scalecenter);

  // Add a clipping mask for the heatmap (for panning click-and-drag)
  chartGroup = new Group();
  clipMask = new Path.Rectangle(chartbox);
  chartGroup.addChild(clipMask);
  chartGroup.addChild(heatmap);
  chartGroup.sendToBack();
  chartGroup.clipped = true;
  
  toc = Date.now();
  console.log("Image loading and scaling: " + ((toc-tic)>=1 ? (toc-tic) : "< 1") + " ms");
  tic = Date.now();

  // Mouse box (to catch mouse events on top of drawn objects)
  mousebox = new Shape.Rectangle(paper.view.bounds);
  mousebox.fillColor = "white";
  mousebox.strokeColor = new Color(1,0,0);
  mousebox.opacity = 0.0;
  mousebox.onMouseMove = mouseboxOnMouseMove;
  mousebox.onMouseDrag = mouseboxOnMouseDrag;
  mousebox.onClick = mouseboxOnClick;
  mousebox.onMouseUp = mouseboxOnMouseUp;
  mousebox.onMouseLeave = mouseboxOnMouseLeave;
  mousebox.minDistance = 50;
  console.log("created mousebox");
  mousebox.bringToFront();
  
  // Plot color key
  plot_color_key();

  toc = Date.now();
  console.log("Color key drawing: " + ((toc-tic)>=1 ? (toc-tic) : "< 1") + " ms");
  tic = Date.now();
  
  // Set zoom button names
  if (fixedvarname == "Min TWR") {
    group1Name = "Payload range";
    group2Name = "\u0394v range";
  } else if (fixedvarname == "Payload") {
    group1Name = "Min TWR range";
    group2Name = "\u0394v range";
  } else if (fixedvarname == "Delta-v") {
    group1Name = "Min TWR range";
    group2Name = "Payload range";
  }
  $("#lblVar1ZoomGroup").text(group1Name);
  $("#lblVar2ZoomGroup").text(group2Name);
  
  // Make details and control panels visible
  document.getElementById("detailspane").style.visibility = "visible";
  document.getElementById("controls").style.visibility = "visible";    

  detailsLocked = false;
  document.getElementById("lockedTooltip").style.visibility = "hidden";

  console.log("CHART COMPUTATION DONE");
  
  paper.view.draw()
  
  // smooth scroll to canvas using jquery
  $('html, body').animate({
      scrollTop: $("#myCanvas").offset().top
  }, 400);

}

// Calculate button
function calculateButton () {

  console.log("------------------------");

  var retlist = parseInput();
  var valid = retlist[0];
  var error = retlist[1];
  if (valid) {
    recallCache.splice(0,recallCache.length);
    recallIdx = -1;
    storeSettings();
    updateRecallBtns();
    plot_chart();
    setDetailsTitles();
  } else {
    console.log("INVALID INPUT!");
    console.log(error);
  }

}
