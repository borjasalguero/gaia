/**
 */
FxaModuleEnterPassword = (function() {
  'use strict';

  var $ = document.querySelector.bind(document);
  var EMAIL_SELECTOR = '#fxa-user-email';
  var PASSWORD_SELECTOR = '#fxa-pw-input';
  var SHOW_PASSWORD_SELECTOR = '.pack-checkbox';
  var SHOW_PASSWORD_CHECKBOX_SELECTOR = '#fxa-show-pw';
  var PASSWORD_INVALID_ERROR_SELECTOR =
          '#ff-account-password-invalid-error-dialog';
  var PASSWORD_MISMATCH_ERROR_SELECTOR =
          '#ff-account-password-mismatch-error-dialog';

  // only checks whether the password passes input validation
  function isPasswordValid(passwordEl) {
    var passwordValue = passwordEl.value;
    return passwordValue && passwordEl.validity.valid;
  }

  function showPasswordInvalid() {
    // TODO - Hook up to i18n
    FxaModuleErrorOverlay.show('Invalid password');
  }

  function checkPasswordCorrect(email, password, done) {
    // TODO - hook up to client lib to authenticate a user.
    if (password === 'password') return done(true);
    done(false);
  }

  function showCheckingPassword() {
    // TODO - Hook up to i18n
    FxaModuleOverlay.show('Authenticating');
  }

  function hideCheckingPassword() {
    FxaModuleOverlay.hide();
  }

  function showPasswordMismatch() {
    return $(PASSWORD_MISMATCH_ERROR_SELECTOR).classList.add('visible');
  }

  function togglePasswordVisibility() {
    var showPassword = !!$(SHOW_PASSWORD_CHECKBOX_SELECTOR).checked;
    var passwordFieldType = showPassword ? 'text' : 'password';

    $(PASSWORD_SELECTOR).setAttribute('type', passwordFieldType);
  }


  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};

    this.email = options.email;

    $(EMAIL_SELECTOR).innerHTML = options.email;

    // TODO - put the binding in ui.js
    $(SHOW_PASSWORD_SELECTOR).addEventListener(
        'click', togglePasswordVisibility, false);
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    var passwordEl = $(PASSWORD_SELECTOR);

    if ( ! isPasswordValid(passwordEl)) {
      return showPasswordInvalid();
    }

    var passwordValue = passwordEl.value;
    showCheckingPassword();
    checkPasswordCorrect(this.email, passwordValue,
          function(isPasswordCorrect) {
      hideCheckingPassword();
      if ( ! isPasswordCorrect) {
        return showPasswordMismatch();
      }

      this.passwordValue = passwordValue;
      gotoNextStepCallback(FxaModuleStates.SIGNIN_SUCCESS);
    }.bind(this));
  };

  return Module;

}());

