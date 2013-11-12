/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */
FxaModuleEnterEmail = (function() {
  'use strict';


  function isEmailValid(emailEl) {
    // user can skip ff account creation with no error
    // if no email is entered.
    return ! emailEl.value || emailEl.validity.valid;
  }

  function showInvalidEmail() {
    // TODO - Hook up to i18n
    FxaModuleErrorOverlay.show('Invalid email');
  }

  function showCheckingEmail() {
    // TODO - Hook up to i18n
    FxaModuleOverlay.show('Checking email');
  }

  function hideCheckingEmail() {
    FxaModuleOverlay.hide();
  }

  function getNextState(email, done) {
    // User can abort FTE without entering an email address.
    if ( ! email) return done(FxaModuleStates.DONE);

    showCheckingEmail();
    isReturningUser(email, function(isReturning) {
      hideCheckingEmail();
      FxaModuleManager.setParam('email', email);
      done(isReturning ? FxaModuleStates.SET_PASSWORD : FxaModuleStates.ENTER_PASSWORD);
    });
  }

  function isReturningUser(email, done) {
    setTimeout(function() {
      // TODO - hook this up to a backend somewhere.
      done(email === 'newuser@newuser.com');
    }, 500);
  }

  var Module = Object.create(FxaModule);
  Module.init = function() {
    this.importElements('fxa-email-input');
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    var emailEl = this.fxaEmailInput;

    if ( ! isEmailValid(emailEl)) return showInvalidEmail();

    var emailValue = emailEl.value;
    this.emailValue = emailValue;

    getNextState(emailValue, gotoNextStepCallback);
  };

  return Module;

}());

