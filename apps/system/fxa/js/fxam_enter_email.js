/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */
FxaModuleEnterEmail = (function() {
  'use strict';

  var states = FxaModulesStates;
  var FF_ACCOUNT_EMAIL_SELECTOR = '#fxa-email-input';
  // TODO update for invalid email dialogs.
  var INVALID_EMAIL_ERROR_SELECTOR = '#invalid-email-error-dialog';

  function $(selector) {
    return document.querySelector(selector);
  }

  function isEmailValid(emailEl) {
    // user can skip ff account creation with no error
    // if no email is entered.
    return ! emailEl.value || emailEl.validity.valid;
  }

  function showInvalidEmail() {
    return $(INVALID_EMAIL_ERROR_SELECTOR).classList.add('visible');
  }

  function showCheckingEmail() {
    FxaModuleOverlay.show('Checking email');
  }

  function hideCheckingEmail() {
    FxaModuleOverlay.hide();
  }

  function getNextState(email, done) {
    showCheckingEmail();
    // TODO - hook this up to a backend somewhere.
    setTimeout(function() {
      hideCheckingEmail();
      if ( ! email) return done(states.DONE);
      if (email === 'newuser@newuser.com') return done(states.SET_PASSWORD);

      done(states.ENTER_PASSWORD);
    }, 500);
  }

  var Module = {
    init: function() {
      // nothing to do here.
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

