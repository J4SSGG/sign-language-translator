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

//Funciones para enviar archivos-------------------------------------------------------
function makeblobBlob(dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: contentType });
  }
  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Format the request and send it.
function sendRequestBlob(file) {
  var baseUri = `http://52.249.197.205/image`;

  var form = new FormData();
  form.append("image", file);

  var request = new XMLHttpRequest();
  request.open("POST", baseUri);

  request.onload = function () {
    var data = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      console.log(data);  
    }else {
      console.log("pues no sirvio el print");
    }
  }
  
  
  request.send(form);
  //request.setRequestHeader('BingAPIs-Market', 'en-US');
  //request.addEventListener('load', handleResponse);
}



function handleQueryBlob(canvas) {
  showWait();
  console.log('Termino showWait');
  // Make sure user provided a subscription key and image.
  //var responseDiv = document.getElementById('responseSection');

  // Clear out the response from the last query.
  //while (responseDiv.childElementCount > 0) {
     // responseDiv.removeChild(responseDiv.lastChild);
  //}

  // Send the request to Bing to get insights about the image.
  var imagePath = document.getElementById('uploadImage');
  var canvas = document.getElementById("canvas");
  canvas.width = imagePath.width;
  canvas.height = imagePath.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(imagePath, 0,0, imagePath.width, imagePath.height);
  sendRequestBlob (makeblob(canvas.toDataURL('image/png')));

}


navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
