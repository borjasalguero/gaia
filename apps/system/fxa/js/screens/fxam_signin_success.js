/**
 * Display the signup success message to the user.
 */
FxaModuleSigninSuccess = (function() {
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

  Module.onNext = function() {
    FxaModuleManager.done();
  };

  return Module;

}());

FxaModuleSigninSuccess.init();
