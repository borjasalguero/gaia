FxaModule = (function() {
  'use strict';

  var Module = {
    init: function() {
      // override ..
    },

    initNav: function() {
      var currentPanel = document.querySelector(location.hash);
      if (!currentPanel)
        return;

      var nextButton = currentPanel.querySelector('.right');
      var backButton = currentPanel.querySelector('.left');

      nextButton && nextButton
        .addEventListener('click', this.onNext.bind(this, function(state) {
          //TODO(Olav): No more states, callbacks or gotos!
          // Instead, manipulate the location.hash directly.
          location.hash = state.id;
        }), false);

      backButton && backButton
        .addEventListener('click', FxaModuleNavigation.back, false);
    },

    onNext: function() {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, change url hash to an id from fxam_states.js
    },

    importElements: function() {
      var ids = [].slice.call(arguments, 0);
      ids.forEach(function(id) {
        this[Utils.camelCase(id)] = document.getElementById(id);
      }, this);
    }
  };

  return Module;

}());
