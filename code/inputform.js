// INPUT FORM

// Sets the fixed variable, modifying the input form as required
function setFixedVar(newfixedvar) {
  if (fixedvarname != newfixedvar) {
    fixedvarname = newfixedvar;
    var refselect;
    if (newfixedvar == "Payload") {
      var1name = "Min TWR";
      var1decs = 1;
      var2name = "Delta-v";
      var2decs = 0;
      $('#lblFixedVar').html("Payload mass");
      $('#txtFixedVar').attr({"min":"0","step":"1","placeholder":"fixed payload mass"});
      $('#unitsFixedVar').html("tonnes");
      $('#lblVar1').html("TWR range");
      $('#unitsVar1').html("relative to");
      $('#txtVar1Min').attr({"min":"0","step":"0.1","placeholder":"min TWR"});
      $('#txtVar1Max').attr({"min":"0","step":"0.1","placeholder":"max TWR"});
      $('#inputgroupVar1').append($('#TWRrefSelect'));
      $('#lblVar2').html("&#916;v range");
      $('#unitsVar2').html("m/s");
      $('#txtVar2Min').attr({"min":"0","step":"100","placeholder":"minimum \u0394v"});
      $('#txtVar2Max').attr({"min":"0","step":"100","placeholder":"maximum \u0394v"});        
    } else if (newfixedvar == "Min TWR") {
      var1name = "Payload";
      var1decs = 0;
      var2name = "Delta-v";
      var2decs = 0;
      $('#lblFixedVar').html("Min TWR");
      $('#unitsFixedVar').html("relative to");
      $('#txtFixedVar').attr({"min":"0","step":"0.1","placeholder":"fixed min TWR"});
      $('#inputgroupVarFixed').append($('#TWRrefSelect'));
      $('#lblVar1').html("Payload range");
      $('#unitsVar1').html("tonnes");
      $('#txtVar1Min').attr({"min":"0","step":"1","placeholder":"minimum payload"});
      $('#txtVar1Max').attr({"min":"0","step":"1","placeholder":"maximum payload"});
      $('#lblVar2').html("&#916;v range");
      $('#unitsVar2').html("m/s");
      $('#txtVar2Min').attr({"min":"0","step":"100","placeholder":"minimum \u0394v"});
      $('#txtVar2Max').attr({"min":"0","step":"100","placeholder":"maximum \u0394v"});         
    } else if (newfixedvar == "Delta-v") {
      var1name = "Min TWR";
      var1decs = 1;
      var2name = "Payload";      
      var2decs = 0;
      $('#lblFixedVar').html("Delta-v");
      $('#txtFixedVar').attr({"min":"0","step":"100","placeholder":"fixed \u0394v"});
      $('#unitsFixedVar').html("m/s");
      $('#lblVar1').html("TWR range");
      $('#unitsVar1').html("relative to");
      $('#txtVar1Min').attr({"min":"0","step":"0.1","placeholder":"min TWR"});
      $('#txtVar1Max').attr({"min":"0","step":"0.1","placeholder":"max TWR"});
      $('#inputgroupVar1').append($('#TWRrefSelect'));
      $('#lblVar2').html("Payload range");
      $('#txtVar2Min').attr({"min":"0","step":"1","placeholder":"minimum payload"});
      $('#txtVar2Max').attr({"min":"0","step":"1","placeholder":"maximum payload"});
      $('#unitsVar2').html("tonnes");
    } else {
      console.log("Invalid new fixed var ", newfixedvar);
      return;
    }
    $('#txtFixedVar').val("");
    $('#txtVar1Min').val("");
    $('#txtVar1Max').val("");
    $('#txtVar2Min').val("");
    $('#txtVar2Max').val("");
  }
}

// Check/uncheck all boxes in a group
// If not all checked, check all; if all checked, uncheck all.
function toggleboxes(groupname) {
  checkboxes = document.getElementsByName(groupname);
  var count = 0;
  for (var i=0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) count += 1;
  }
  var state = !(count == checkboxes.length);
  for (var i=0; i < checkboxes.length; i++) {
    checkboxes[i].checked = state;
  }
  if (groupname == "exoticengines") $('#chkDawnSP').prop('disabled', !state);
}

// Loads an example set of parameters
function load_example () {
  fixedvarname = "";
  setFixedVar("Payload");
  $('#pillPayload').addClass("active")
  $('#pillTWR').removeClass("active")
  $('#pillDeltav').removeClass("active")
  $('#txtFixedVar').val('10');
  $('#txtVar1Min').val('0.5');
  $('#txtVar1Max').val('1.0');
  $('#txtVar2Min').val('0');
  $('#txtVar2Max').val('5000');
  $('#TWRrefSelect').val("Kerbin");
  $('#atmpres').val('0');
  $('#atmpresetsmenu').val("vacuum");
  $('#maxengines').val('10');
  $('#unlimitedchkbox').prop('checked',false);
  $('#maxengines').prop('disabled',false);
  $('input[type=radio]').prop('checked', function () {
      return this.getAttribute('checked') == 'checked';
  });
}

// Sets or unsets the "unlimited engines" checkbox and text input
function toggleunlimited () {
  if ($('#unlimitedchkbox').prop("checked")) {
    $('#maxengines').prop('disabled', true);
  } else {
    $('#maxengines').prop('disabled', false);
  }
}

// Sets the pressure from a clicked preset
function setAtmoPreset () {
  selected = $('#atmpresetsmenu').find(":selected").val();
  if (selected == "vacuum") {
    $('#atmpres').val(0);
  } else if (selected == "Kerbin") {
    $('#atmpres').val(1.0);
  } else if (selected == "Duna") {
    $('#atmpres').val(0.2);    
  } else if (selected == "Laythe") {
    $('#atmpres').val(0.6);
  } else if (selected == "Eve") {
    $('#atmpres').val(5.0);
  }
}

// Updates the presets dropdown to the relevant option
function updateAtmoPresets () {
  pres = $('#atmpres').val();
  if (pres == 0) {
    $('#atmpresetsmenu').val("vacuum");
  } else if (pres == 1.0) {
    $('#atmpresetsmenu').val("Kerbin");
  } else if (pres == 0.2) {
    $('#atmpresetsmenu').val("Duna");
  } else if (pres == 0.6) {
    $('#atmpresetsmenu').val("Laythe");
  } else if (pres == 5.0) {
    $('#atmpresetsmenu').val("Eve");
  } else {
    $('#atmpresetsmenu').val("custom");
  }
}  

// Enable/disable Dawn SP checkbox
function changeDawnChk () {
  if ($('#chkIX-6315').prop("checked")) {
    $('#chkDawnSP').prop('disabled', false);
  } else {
    $('#chkDawnSP').prop('disabled', true);
  }
}

// Parses and validates input form and prepares variables for calculation
function parseInput () {

  // Read and validate input variables 
  fixedvar = parseFloat($('#txtFixedVar').val());
  if ((isNaN(fixedvar)) || (fixedvar < 0))
    return [false, "bad fixedvar: " + fixedvar];
  
  var1min = parseFloat($('#txtVar1Min').val());
  if (isNaN(var1min) || (var1min < 0))
    return [false, "bad var1min: " + var1min];
   
  var1max = parseFloat($('#txtVar1Max').val());
  if ((isNaN(var1max)) || (var1min >= var1max))
    return [false, "bad var1max: " + var1max];
    
  var1range = var1max - var1min;
  
  var2min = parseFloat($('#txtVar2Min').val());
  if (isNaN(var2min) || (var2min < 0))
    return [false, "bad var2min: " + var2min];
    
  var2max = parseFloat($('#txtVar2Max').val());
  if ((isNaN(var2max)) || (var2min >= var2max))
    return [false, "bad var2max: " + var2max];
  
  var2range = var2max - var2min;
  
  TWRref = $('#TWRrefSelect').val();
  gloc = surfgrav[TWRref];
  if (!gloc) return [false, "Bad gloc: " + gloc];
  
  atmpres = parseFloat($('#atmpres').val());
  if (isNaN(atmpres)) return [false, "Bad atmpres: " + atmpres];
  
  if ($('#unlimitedchkbox').prop("checked")) {
    maxengines = 0;
  } else {   
    maxengines = parseFloat($('#maxengines').val());
    if (isNaN(maxengines)) return [false, "Bad maxengines: " + maxengines];
  }

  // Load only selected engines
  engines = [];
  for (var i=0; i < allEngines.length; i++) {
    if ($('#chk'+allEngines[i].name).prop("checked")) {
      // Add 100kg to mass of "Dawn" if SP checkbox checked
      if (allEngines[i].name == "IX-6315") {
        if ($('#chkDawnSP').prop('checked')) {
          allEngines[i].mass = 0.35;
          console.log("Adding 100kg of solar panels to Dawn engine");
        } else {
          allEngines[i].mass = 0.25;
        }
        allEngines[i].TWR = allEngines[i].vac_thrust/(allEngines[i].mass*g0);
      }
      engines.push(allEngines[i]);        
    }
  }
  if (engines.length < 1) eturn [false, "Bad engines.length: " + engines.length];
  
  // Adjust Isp, thrust and TWR of engines for given atmospheric pressure
  // and local gravity
  for (var i=0; i < engines.length; i++) {
    engines[i].update(atmpres, gloc);
  }

  return [true, ""];
  
}

// Updates the ranges of the plotted variables (and the input fields)
function setRanges (newVar1min, newVar1max, newVar2min, newVar2max) {

  $('#txtVar1Min').val(newVar1min);
  $('#txtVar1Max').val(newVar1max);
  $('#txtVar2Min').val(newVar2min);
  $('#txtVar2Max').val(newVar2max)
  var1min = newVar1min;
  var1max = newVar1max;
  var2min = newVar2min;
  var2max = newVar2max;
  var1range = newVar1max - newVar1min;
  var2range = newVar2max - newVar2min;

}
