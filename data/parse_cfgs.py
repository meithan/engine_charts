# Reads the engine stats directly from the game's cfg files
# Outputs the relevant JavaScript code with the data

# ================================

# CONFIGURE PATH TO TOP-LEVEL KSP DIRECTORY HERE
# (or use ./ and run script directly in topdir)
KSP_dir = "./"

# ================================

# List of engine config tuples (name, nickname, cfg file) to process
if not KSP_dir.endswith("/"): KSP_dir += "/"
path = KSP_dir + "GameData/Squad/Parts/Engine/"
engines = [
("LV-909", "Terrier", "liquidEngineLV-909/liquidEngineLV-909.cfg"),
("LV-T30", "Reliant", "liquidEngineLV-T30/liquidEngineLV-T30.cfg"),
("LV-T45", "Swivel", "liquidEngineLV-T45/liquidEngineLV-T45.cfg"),
("T-1", "Aerospike", "liquidEngineAerospike/liquidEngineAerospike.cfg"),
("LV-N", "Nerv", "liquidEngineLV-N/liquidEngineLV-N.cfg"),
("Mk-55", "Thud", "liquidEngineMk55/liquidEngineMk55.cfg"),
("CR-7", "RAPIER", "rapierEngine/rapierEngine.cfg"),
("RE-L10", "Poodle", "liquidEnginePoodle/liquidEnginePoodle.cfg"),
("RE-I5", "Skipper", "liquidEngineSkipper/skipperLiquidEngine.cfg"),
("RE-M3", "Mainsail", "liquidEngineMainsail/liquidEngineMainsail.cfg"),
("KR-2L", "Rhino", "Size3AdvancedEngine/part.cfg"),
("KS-25x4", "Mammoth", "Size3EngineCluster/part.cfg"),
("KR-1x2", "Twin Boar", "Size2LFB/part.cfg"),
("LV-1", "Ant", "liquidEngineLV-1/liquidEngineLV-1.cfg"),
("LV-1R", "Spider", "liquidEngineLV-1R/liquidEngineLV-1R.cfg"),
("24-77", "Twitch", "liquidEngine24-77/liquidEngine24-77.cfg"),
("48-7S", "Spark", "liquidEngine48-7S/liquidEngine48-7S.cfg"),
("O-10", "Puff", "OMSEngine/omsEngine.cfg"),
("IX-6315", "Dawn", "ionEngine/ionEngine.cfg"),
("KS-25", "Vector", "liquidEngineSSME/SSME.cfg")
]

# ================================

# Returns number as string without trailing zeros (and decimal point if
# no decimals required)
def nice(number):
  s = "%f" % number
  if "." in s: s = s.rstrip('0').rstrip('.')
  return s

# Formats the atmosphere curve as a string
def niceatmocurve(curve):
  buf = "["
  for i,point in enumerate(curve):
    buf += "[%s,%s]" % (nice(point[0]), nice(point[1]))
    if i < len(curve)-1: buf += ", "
  buf += "]"
  return buf

# ================================

# Parse cfg files
results = []
for engine in engines:
  params = []
  f = open(path+engine[2],"r")
  line = f.readline()
  cyclemode = None
  while line != '':
    if "mass =" in line: params.append(float(line.split()[2]))
    if "maxThrust =" in line and (engine[1] != "RAPIER" or cyclemode == "ClosedCycle"): params.append(float(line.split()[2]))
    if "engineID =" in line: cyclemode = line.split()[2]
    if "atmosphereCurve" in line and (engine[1] != "RAPIER" or cyclemode == "ClosedCycle"):
      atmocurve = []
      line2 = f.readline()
      while "}" not in line2:
        if "key" in line2:
          foo = map(float, line2.split()[2:4])
          atmocurve.append([foo[0],foo[1]])
        line2 = f.readline()        
      params.append(atmocurve)
    line = f.readline()
  if engine[0] == "LV-N": params.append(7.0)
  elif engine[0] == "O-10": params.append(6.0)
  else: params.append(8.0)
  if len(params) == 4: results.append([engine[0],engine[1]]+params)
  else:
    print "Couldn't parse all values for %s!" % engine[1]
    print params

# Output JavaScript code
print "    allEngines = ["
for i,engine in enumerate(results):
  buf = '      new Engine("%s", "%s", %s, %s, %s, %s)' % (engine[0], engine[1], nice(engine[2]), nice(engine[3]), niceatmocurve(engine[4]), nice(engine[5]))
  if i < len(results)-1: buf += ","
  print buf
print "    ];"
