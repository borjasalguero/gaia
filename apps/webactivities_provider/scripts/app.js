'use strict';

var App = (function App() {

  var button;
  var activity = null;

  function init () {
    button = document.getElementById('close');
    // Add listeners
    button.addEventListener('click', function handleClick() {
      if (activity) {
        activity.postResult({ success: true });
      } else {
        window.close();
      }
    });

    // Add activity listener
    window.navigator.mozSetMessageHandler('activity', function(activityRequest) {
      activity = activityRequest;
    });
  }
 
  return {
    init: init
  };

})();

window.onload = App.init;
