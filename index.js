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
  xk.greenLedOn();
});

atem.on('disconnect', function () {
  console.log('ATEM Connected');
  xk.greenLedOff();
});

atem.on('error', function (err) {
  console.log('ERROR: ' + err.toString);
});

function setLights() {
  var previewLight = (currentPreview * 2) + 11;
  var programLight = (currentProgram * 2) + 10;

  xk.allLightsOff();
  if (10 <= programLight && programLight <= 27) {
    xk.redLightOn(programLight);
  }

  if (10 <= previewLight && previewLight <= 27) {
    xk.blueLightOn(previewLight);
  }

  if (currentOnAir) {
    xk.redLightOn(6);
  }

  if (currentOnAirTransition) {
    xk.blueLightOn(7);
  }
}  

function setME1Preview(input) {
  atem.changePreviewInput(input, 0);
}

function setME1Program(input) {
  atem.changeProgramInput(input, 0);
}

downhandlers = [];

downhandlers[0] = function () {
  // Macro 1
  atem.changePreviewInput(2, 0)
  atem.autoTransition(0)
}

downhandlers[1] = function () {
  // Macro 2
  atem.changePreviewInput(3, 0)
  atem.autoTransition(0)
}

downhandlers[2] = function () {
  // Macro 3
  atem.changePreviewInput(0, 0)
  atem.autoTransition(0)
}

downhandlers[3] = function () {
  // Macro 4
  atem.changePreviewInput(4, 0)
  atem.autoTransition(0)
}

downhandlers[6] = function () {
  atem.changeUpstreamKeyState(0, currentOnAir ? 0 : 1, 0);  
}

downhandlers[7] = function () {
  atem.changeUpstreamKeyNextState(0, currentOnAirTransition ? 0 : 1, 0);
}

downhandlers[11] = setME1Preview.bind({}, 0)
downhandlers[13] = setME1Preview.bind({}, 1)
downhandlers[15] = setME1Preview.bind({}, 2)
downhandlers[17] = setME1Preview.bind({}, 3)
downhandlers[19] = setME1Preview.bind({}, 4)
downhandlers[21] = setME1Preview.bind({}, 5)
downhandlers[23] = setME1Preview.bind({}, 6)
downhandlers[25] = setME1Preview.bind({}, 7)
downhandlers[27] = setME1Preview.bind({}, 8)

downhandlers[10] = setME1Program.bind({}, 0)
downhandlers[12] = setME1Program.bind({}, 1)
downhandlers[14] = setME1Program.bind({}, 2)
downhandlers[16] = setME1Program.bind({}, 3)
downhandlers[18] = setME1Program.bind({}, 4)
downhandlers[20] = setME1Program.bind({}, 5)
downhandlers[22] = setME1Program.bind({}, 6)
downhandlers[24] = setME1Program.bind({}, 7)
downhandlers[26] = setME1Program.bind({}, 8)


downhandlers[28] = function () {
  atem.autoTransition(0);
}

xk.on('keydown', function (key) {
  if ('function' == typeof downhandlers[key]) {
    downhandlers[key]()
  }
})

xk.greenLedOff();
xk.redLedOff();

atem.connect('192.168.0.133');
