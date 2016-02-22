# Reads the engine stats directly from the game's cfg files
# Outputs the relevant JavaScript code with the data

# List of (name, nickname, cfg file) tuples to process
engines = [
("LV-909", "Terrier", "Engine/liquidEngineLV-909/liquidEngineLV-909.cfg"),
("LV-T30", "Reliant", "Engine/liquidEngineLV-T30/liquidEngineLV-T30.cfg"),
("LV-T45", "Swivel", "Engine/liquidEngineLV-T45/liquidEngineLV-T45.cfg"),
("T-1", "Aerospike", "Engine/liquidEngineAerospike/liquidEngineAerospike.cfg"),
("LV-N", "Nerv", "Engine/liquidEngineLV-N/liquidEngineLV-N.cfg"),
("Mk-55", "Thud", "Engine/liquidEngineMk55/liquidEngineMk55.cfg"),
("CR-7", "RAPIER", "Engine/rapierEngine/rapierEngine.cfg"),
("RE-L10", "Poodle", "Engine/liquidEnginePoodle/liquidEnginePoodle.cfg"),
("RE-I5", "Skipper", "Engine/liquidEngineSkipper/skipperLiquidEngine.cfg"),
("RE-M3", "Mainsail", "Engine/liquidEngineMainsail/liquidEngineMainsail.cfg"),
("KR-2L", "Rhino", "Engine/Size3AdvancedEngine/part.cfg"),
("KS-25x4", "Mammoth", "Engine/Size3EngineCluster/part.cfg"),
("KR-1x2", "Twin Boar", "Engine/Size2LFB/part.cfg"),
("LV-1", "Ant", "Engine/liquidEngineLV-1/liquidEngineLV-1.cfg"),
("LV-1R", "Spider", "Engine/liquidEngineLV-1R/liquidEngineLV-1R.cfg"),
("24-77", "Twitch", "Engine/liquidEngine24-77/liquidEngine24-77.cfg"),
("48-7S", "Spark", "Engine/liquidEngine48-7S/liquidEngine48-7S.cfg"),
("O-10", "Puff", "Engine/OMSEngine/omsEngine.cfg"),
("IX-6315", "Dawn", "Engine/ionEngine/ionEngine.cfg"),
("KS-25", "Vector", "Engine/liquidEngineSSME/SSME.cfg")
]

# Parse cfg files
results = []
for engine in engines:
  params = []
  f = open(engine[2],"r")
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

# Output JavaScript code
print "    allEngines = ["
for i,engine in enumerate(results):
  buf = '      new Engine("%s", "%s", %s, %s, %s, %s)' % (engine[0], engine[1], nice(engine[2]), nice(engine[3]), niceatmocurve(engine[4]), nice(engine[5]))
  if i < len(results)-1: buf += ","
  print buf
print "    ];"
