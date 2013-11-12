/**
 * Display the signup success message to the user.
 */
FxaModuleSigninSuccess = (function() {
  'use strict';

  var $ = document.querySelector.bind(document);
  var EMAIL_SELECTOR = '#fxa-summary-email';

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};
    $(EMAIL_SELECTOR).innerHTML = options.email;
  };

  Module.onNext = function(gotoNextStepCallback) {
    getNextState(gotoNextStepCallback);
  };

  return Module;

}());

