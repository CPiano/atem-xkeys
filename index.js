var _ = require('lodash');
var xk = require('./xkeys');
var ATEM = require('applest-atem');
var atem = new ATEM();

var currentProgram;
var currentPreview;
var currentOnAir;
var currentOnAirTransition;

atem.on('stateChanged', function (err, state) {
  var change = false;

  if (atem.state && atem.state.video && atem.state.video.ME && Array.isArray(atem.state.video.ME)) {
    if ((atem.state.video.ME[0].programInput != null) && (currentProgram != atem.state.video.ME[0].programInput)) {
      currentProgram = atem.state.video.ME[0].programInput;
      change = true;
    }

    if ((atem.state.video.ME[0].previewInput != null) && (currentPreview != atem.state.video.ME[0].previewInput)) {
      currentPreview = atem.state.video.ME[0].previewInput;
      change = true;
    }
    
    if ((atem.state.video.ME[0].upstreamKeyState != null) && (currentOnAir != atem.state.video.ME[0].upstreamKeyState[0])) {
      currentOnAir = atem.state.video.ME[0].upstreamKeyState[0];
      change = true;
    }

    if ((atem.state.video.ME[0].upstreamKeyNextState != null) && (currentOnAirTransition != atem.state.video.ME[0].upstreamKeyNextState[0])) {
      currentOnAirTransition = atem.state.video.ME[0].upstreamKeyNextState[0];
      change = true;
    }

    if (change) {
      setLights();
    }
  } 
});

atem.on('connect', function () {
  console.log('ATEM Connected');
});

atem.on('error', function (err) {
  console.log('ERROR: ' + err.toString);
});

function setLights() {
  var previewLight = (currentPreview * 2) + 15;
  var programLight = (currentProgram * 2) + 14;

  xk.allLightsOff();
  xk.redLightOn(programLight);
  xk.blueLightOn(previewLight);  

  if (currentOnAir) {
    xk.redLightOn(10);
  }

  if (currentOnAirTransition) {
    xk.blueLightOn(11);
  }
}  


xk.on('keydown', function (key) {
  if (key <= 7) {
    console.log('Placeholder for Macro ' + key);
  } else if (10 === key) {
    atem.changeUpstreamKeyState(0, currentOnAir ? 0 : 1, 0);
  } else if (11 === key) {
    atem.changeUpstreamKeyNextState(0, currentOnAirTransition ? 0 : 1, 0);
  } else if ((14 <= key) && (key <= 27)) {
    var input = Math.floor((key - 14) / 2);
    var isPrev = (key % 2) === 1;
    
    if (isPrev) {
      atem.changePreviewInput(input, 0);
    } else {
      atem.changeProgramInput(input, 0);
    }

  } else if (28 === key) {
    atem.autoTransition(0);
  }
});

atem.connect('192.168.0.133');
