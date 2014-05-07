'use strict';

var App = (function App() {

  var button;
  var activity = null;

  function launchCall(identifier) {
    var host = document.location.host;
    var protocol = document.location.protocol;
    var urlBase = protocol + '//' + host + '/call.html?id=' + identifier;
    window.open(urlBase, 'call_screen', 'attention');
  }

  function init () {
    button = document.getElementById('call_loop');
    // Add listeners
    button.addEventListener('click', function handleClick() {
      // CHECK: This is not working because is not implemented, but
      // this should be in Gecko in the future. This is the way of getting
      // the cameras available.
      //
      // var videoSources = [];
      // MediaStreamTrack.getSources(function(sources) {
      //   sources.forEach(function(source) {
      //     source.kind === 'video' && videoSources.push(source);
      //   })
      //   console.log(JSON.stringify(videoSources));
      // });

      if (!localStorage.permissionsGranted) {
        navigator.mozGetUserMedia(
          {
            audio: true
          },
          function(stream) {
            stream.stop();
            localStorage.permissionsGranted = true;
            launchCall(123456);
          },
          function(err) {
            console.log("An error occured! " + err);
          }
        );
      } else {
        launchCall(123456);
      }
    });

    if (!window.navigator.mozSetMessageHandler) {
      return;
    }

    window.navigator.mozSetMessageHandler('activity', function(activityRequest) {
      launchCall(activityRequest.data && activityRequest.data.id)
    });
    
  }
 
  return {
    init: init
  };

})();

window.onload = App.init;
