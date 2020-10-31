/*
    THIS CODE IS FORKED FROM GITHUB https://raw.githubusercontent.com/webrtc/samples/gh-pages/src/content/devices/input-output/js/main.js
    THIS CODE IS USED FOR EDUCATIONAL PURPOSES ONLY

*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';



const videoElement = document.querySelector('video');
let videoSelect = [];
let deviceIndex = 0;

function gotDevices(deviceInfos) {

  // Handles being called several times to update labels. Preserve values.
  // elimina la lista de camaras
  videoSelect = [];

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    let option = { value : '', text : ''};
    option.value = deviceInfo.deviceId;

    if (deviceInfo.kind === 'videoinput') {
      option.text = `Camera ${i + 1}`;
      videoSelect.push(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }

  deviceIndex = ++deviceIndex % videoSelect.length;
}


function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function start() {
  
  stop();

  const videoSource = videoSelect[deviceIndex].value;
  const constraints = {
    video: {
      deviceId: videoSource ? {
        exact: videoSource
      } : undefined
    }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
  return videoSelect[deviceIndex];
}

function stop(){
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
