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
    var self = this;
    this.onChange('email', function(email) {
      self.fxaSummaryEmail.innerHTML = email;
    });
  };

  Module.onNext = function() {
    FxaModuleManager.done();
  };

  return Module;

}());

FxaModuleSigninSuccess.init();
