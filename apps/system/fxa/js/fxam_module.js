

FxaModule = (function() {
  "use strict";

  var Module = {
    init: function() {
      // override this to do initialization
    },

    onNext: function(gotoNextStepCallback) {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, call gotoNextStepCallback with the next state from
      // fxam_states.js
    },

    onBack: function() {
      // handle "back" button presses.
    }
  };

  return Module;

}());

