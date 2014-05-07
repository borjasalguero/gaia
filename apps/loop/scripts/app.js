'use strict';

var App = (function App() {

  var button;
  var activity = null;

  function init () {
    button = document.getElementById('call_loop');
    // Add listeners
    button.addEventListener('click', function handleClick() {
      // var videoSources = [];
      // MediaStreamTrack.getSources(function(sources) {
      //   sources.forEach(function(source) {
      //     source.kind === 'video' && videoSources.push(source);
      //   })
      //   console.log(JSON.stringify(videoSources));
      // });



      navigator.mozGetUserMedia(
        {
          video: true,
          audio: true
        },
        function(stream) {
          console.log('Tenemos video y audio al arrncar');
          // var host = document.location.host;
          // var protocol = document.location.protocol;
          // var urlBase = protocol + '//' + host + '/call.html?id=123123';
          // window.open(urlBase, 'call_screen', 'attention');
        },
        function(err) {
          console.log("An error occured! " + err);
        }
      );

      
    });

    // Add activity listener
    // window.navigator.mozSetMessageHandler('activity', function(activityRequest) {
    //   activity = activityRequest;
    //   setTimeout(function() {
    //     activity.postResult({ success: true });
    //   }, 3000);
    // });

    // var telephony = new Audio();
    // telephony.mozAudioChannelType = 'telephony';
    // telephony.src = 'script/resources/phone1.wav';
    // telephony.loop = true;
    // telephony.oncanplay = function() {
    //   console.log('Vamonos al lio');
    // }

    // setTimeout(function() {
    //   telephony.play();
    // }, 1000);
    if (!window.navigator.mozSetMessageHandler) {
      return;
    }

    window.navigator.mozSetMessageHandler('activity', function(activityRequest) {
      activity = activityRequest;
      var host = document.location.host;
      var protocol = document.location.protocol;
      var urlBase = protocol + '//' + host + '/call.html?id=123123';
      window.open(urlBase, 'call_screen', 'attention');
    });
    
  }
 
  return {
    init: init
  };

})();

window.onload = App.init;
