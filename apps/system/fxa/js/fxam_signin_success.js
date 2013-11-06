/**
 * Display the signup success message to the user.
 */
FxaModuleSigninSuccess = (function() {
  'use strict';

  var EMAIL_SELECTOR = '#fxa-summary-email';

  function $(selector) {
    return document.querySelector(selector);
  }

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = {
    id: 'fxa-signin-success',
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

