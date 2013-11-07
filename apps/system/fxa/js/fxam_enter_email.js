/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */
FxaModuleEnterEmail = (function() {
  'use strict';

  var $ = document.querySelector.bind(document);
  var FF_ACCOUNT_EMAIL_SELECTOR = '#fxa-email-input';
  // TODO update for invalid email dialogs.
  var INVALID_EMAIL_ERROR_SELECTOR = '#invalid-email-error-dialog';

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

    console.log("entered email", email);
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

  var Module = {
    id: 'fxa-email',
    init: function() {
      // nothing to do here.
      console.log('initialize the fxa-enter-email state');
    },

    onNext: function(gotoNextStepCallback) {
      var emailEl = $(FF_ACCOUNT_EMAIL_SELECTOR);

      if ( ! isEmailValid(emailEl)) return showInvalidEmail();

      var emailValue = emailEl.value;
      this.emailValue = emailValue;

      getNextState(emailValue, gotoNextStepCallback);
    },

    onBack: function() {
    },

    getEmail: function() {
      return this.emailValue;
    }
  };

  return Module;

}());

