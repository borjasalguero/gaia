'use strict';

var Customizer = (function(setting, resourceType, onerror) {
  var self = this;

  this.init = function() {
    window.addEventListener('customization', function eventHandler(event) {
      if (event.detail.setting === setting) {
        window.removeEventListener('customization', eventHandler);
        var URI = event.detail.value;
        Resources.load(URI, resourceType, self.set,
          function onerrorRetrieving(status) {
            console.error('Customizer.js: Error retrieving the resource.');
            onerror && onerror(status);
          }
        );
      }
    });
  };
});
