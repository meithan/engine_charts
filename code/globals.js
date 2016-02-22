
// Global chart settings
var mapx = 500;
var mapy = 500;
var ticklength = mapx/70;
var tickLabelPad = 20;
var fontSize = 18;
var chartoffset = 65;

// Global vars
var fixedvarname, var1name, var2name, var1decs, var2decs;
var fixedvar, var1min, var1max, var1range, var2min, var2max, var2range;
var gloc, maxengines, atmpres, paystep, dvstep, recallCache, recallIdx;
var dvdecs, paydecs, nx, ny, engines, allEngines;
var heatmap, tickSymbol, gridlineSymbol, chartbox, chartboxPath, mousebox, lastpos;
var zoombox, zoomstart, zoomStarted, panstart, mapstart, panStarted;
var hairlineH, hairlineV, detailsLocked;
var chartLayer, colorkeyLayer;
var tic, toc;

// Engine color palette
//palette = [[77,77,77],[93,165,218],[250,164,58],[96,189,104],[241,124,176],[178,145,47],[178,118,178],[222,207,63],[241,88,84]];
//palette = [[136,189,230],[38,93,171],[251,178,88],[223,92,36],[144,205,151],[5,151,72],[229,18,111],[85,85,85],[157,114,42],[123,58,150],[199,180,46],[215,31,39],[237,221,70],[228,186,127]];
//palette = [[166,206,227],[31,120,180],[178,223,138],[51,160,44],[251,154,153],[227,26,28],[253,191,111],[255,127,0],[202,178,214],[106,61,154],[255,255,153],[177,89,40]];
palette = [[227, 196, 113], [114, 72, 153], [253, 160, 58], [211, 197, 153], [78, 150, 196], [231, 55, 42], [74, 150, 167], [227, 154, 140], [214, 166, 163], [103, 185, 82], [98, 158, 69], [248, 133, 25], [248, 161, 96], [162, 129, 189], [238, 86, 86], [169, 216, 140], [177, 89, 40], [166, 206, 227],[77,77,77],[250,164,58]];

// Standard gravity
g0 = 9.80655;

// Local surface gravity for all celestial bodies
surfgrav = {
  "Kerbin":g0,
  "Mun":1.63,
  "Minmus":0.491,
  "Duna":2.94 ,
  "Ike":1.10,
  "Eve":16.7,
  "Gilly":0.049,
  "Moho":2.70,
  "Dres":1.13,
  "Jool":7.85,
  "Laythe":7.85,
  "Vall":2.31,
  "Tylo":7.85,
  "Bop":0.589,
  "Pol":0.373,
  "Eeloo":1.69
}
  
// Load engine definitions
// Updated for KSP 1.0.5
allEngines = [
  new Engine("LV-909", "Terrier", 0.5, 60, [[0,345], [1,85], [3,0.001]], 8),
  new Engine("LV-T30", "Reliant", 1.25, 215, [[0,300], [1,280], [7,0.001]], 8),
  new Engine("LV-T45", "Swivel", 1.5, 200, [[0,320], [1,270], [6,0.001]], 8),
  new Engine("T-1", "Aerospike", 1, 180, [[0,340], [1,290], [5,230], [10,170], [20,0.001]], 8),
  new Engine("LV-N", "Nerv", 3, 60, [[0,800], [1,185], [2,0.001]], 7),
  new Engine("Mk-55", "Thud", 0.9, 120, [[0,305], [1,275], [9,0.001]], 8),
  new Engine("CR-7", "RAPIER", 2, 180, [[0,305], [1,275], [9,0.001]], 8),
  new Engine("RE-L10", "Poodle", 1.75, 250, [[0,350], [1,90], [3,0.001]], 8),
  new Engine("RE-I5", "Skipper", 3, 650, [[0,320], [1,280], [6,0.001]], 8),
  new Engine("RE-M3", "Mainsail", 6, 1500, [[0,310], [1,285], [9,0.001]], 8),
  new Engine("KR-2L", "Rhino", 9, 2000, [[0,340], [1,255], [5,0.001]], 8),
  new Engine("KS-25x4", "Mammoth", 15, 4000, [[0,315], [1,295], [12,0.001]], 8),
  new Engine("KR-1x2", "Twin Boar", 6.5, 2000, [[0,300], [1,280], [9,0.001]], 8),
  new Engine("LV-1", "Ant", 0.02, 2, [[0,315], [1,80], [3,0.001]], 8),
  new Engine("LV-1R", "Spider", 0.02, 2, [[0,290], [1,260], [8,0.001]], 8),
  new Engine("24-77", "Twitch", 0.09, 16, [[0,290], [1,250], [7,0.001]], 8),
  new Engine("48-7S", "Spark", 0.1, 18, [[0,300], [1,270], [7,0.001]], 8),
  new Engine("O-10", "Puff", 0.09, 20, [[0,250], [1,120], [4,0.001]], 6),
  new Engine("IX-6315", "Dawn", 0.25, 2, [[0,4200], [1,100], [1.2,0.001]], 8),
  new Engine("KS-25", "Vector", 4, 1000, [[0,315], [1,295], [12,0.001]], 8)
];
