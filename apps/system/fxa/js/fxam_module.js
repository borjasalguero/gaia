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

      this.nextButton = currentPanel.querySelector('.right');
      this.backButton = currentPanel.querySelector('.left');

      if (this.nextButton) {
        this.nextButton
          .addEventListener('tap', this.onNext.bind(this, function(state) {
            //TODO(Olav): No more states, callbacks or gotos!
            // Instead, manipulate the location.hash directly.
            location.hash = state.id;
          }), false);

        new GestureDetector(this.nextButton).startDetecting();
      }

      if (this.backButton) {
        this.backButton
          .addEventListener('tap', function() {
            window.location.hash = 'back';
          }, false);

        new GestureDetector(this.backButton).startDetecting();
      }
    },

    onNext: function() {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, change url hash to an id from fxam_states.js
    },

    setEnabledState: function(button, enabled) {
      if (enabled)
        button.removeAttribute('disabled');
      else
        button.setAttribute('disabled', 'disabled');
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
