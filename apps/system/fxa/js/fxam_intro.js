/**
 * Intro module. Nothing too exciting.
 */
FxaModuleIntro = (function() {
  'use strict';

  var Module = {
    init: function() {
      // nothing to do here.
      console.log('initialize the fxa-intro state');
    },

    onNext: function(gotoNextStepCallback) {
      gotoNextStepCallback(FxaModuleStates.ENTER_EMAIL);
    },

    onBack: function() {
    }
  };

  return Module;

}());

