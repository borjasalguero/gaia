/**
 * Display the password reset success message to the user.
 */
FxaModulePasswordResetSuccess = (function() {
  'use strict';

  var states = FxaModulesStates;
  var EMAIL_SELECTOR = '#ff_account--password_reset_success--email';

  function $(selector) {
    return document.querySelector(selector);
  }

  function getNextState(done) {
    return done(states.DONE);
  }

  var Module = {
    init: function(options) {
      options = options || {};
      $(EMAIL_SELECTOR).innerHTML = options.email;
    },

    onNext: function(gotoNextStepCallback) {
      getNextState(gotoNextStepCallback);
    },

    onBack: function() {
    }

  };

  return Module;

}());

