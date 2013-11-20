/**
 * Display the signup success message to the user.
 */
FxaModuleSignupSuccess = (function() {
  'use strict';

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init() {
    this.initNav();
    this.importElements('fxa-summary-email');
  };

  Module.refresh = function refresh(options) {
    if (options.email)
      this.fxaSummaryEmail.innerHTML = options.email;
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleManager.done();
  };

  return Module;

}());

FxaModuleSignupSuccess.init();
