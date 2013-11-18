/**
 * Display the password reset success message to the user.
 */
FxaModulePasswordResetSuccess = (function() {
  'use strict';

  function getNextState(done) {
    return done(FxaModuleStates.DONE);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init() {
    this.initNav();
    this.importElements(
      'fxa-summary-email'
    );

    var self = this;
    this.onChange('email', function(email) {
      self.fxaSummaryEmail.innerHTML = email;
    });
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    getNextState(gotoNextStepCallback);
  };

  return Module;

}());

FxaModulePasswordResetSuccess.init();
