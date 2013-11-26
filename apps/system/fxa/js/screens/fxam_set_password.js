/**
 * Takes care of a new user's set password screen. If password is valid,
 * attempt to stage the user.
 */
FxaModuleSetPassword = (function() {
  'use strict';

  var _ = null;

  // only checks whether the password passes input validation
  function _isPasswordValid(passwordEl) {
    var passwordValue = passwordEl.value;
    return passwordValue && passwordEl.validity.valid;
  }

  function _enableNext(passwordEl) {
    if (_isPasswordValid(passwordEl)) {
      FxaModuleUI.enableNextButton();
    } else {
      FxaModuleUI.disableNextButton();
    }
  }

  function _showInvalidPassword() {
    FxaModuleErrorOverlay.show(_('fxa-invalid-password'));
  }

  function _requestCreateAccount(email, password, done) {
    FxModuleServerRequest.signUp(email, password,
      function onSuccess(response) {
        done(response.accountCreated);
      },
      done.bind(null, false));
  }

  function _showRegistering() {
    FxaModuleOverlay.show(_('fxa-registering'));
  }

  function _hideRegistering() {
    FxaModuleOverlay.hide();
  }

  function _showUserNotCreated() {
    FxaModuleErrorOverlay.show(_('fxa-cannot-create-account'));
  }

  function togglePasswordVisibility() {
    var showPassword = !!this.fxaShowPw.checked;
    var passwordFieldType = showPassword ? 'text' : 'password';

    this.fxaPwInput.setAttribute('type', passwordFieldType);
  }

  var Module = Object.create(FxaModule);
  Module.init = function init(options) {
    options = options || {};

    _ = navigator.mozL10n.get;

    this.importElements(
      'fxa-user-email',
      'fxa-pw-input',
      'fxa-show-pw'
    );

    this.email = options.email;

    this.fxaUserEmail.textContent = options.email;

    _enableNext(this.fxaPwInput);

    this.fxaPwInput.addEventListener(
      'input',
      function onInput(event) {
        _enableNext(event.target);
      }
    );

    this.fxaShowPw.addEventListener(
        'change', togglePasswordVisibility.bind(this), false);
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    var passwordEl = this.fxaPwInput;

    if (! _isPasswordValid(passwordEl)) {
      _showInvalidPassword();
      gotoNextStepCallback(null);
      return;
    }

    var password = passwordEl.value;
    _showRegistering();
    _requestCreateAccount(this.email, password, function(isAccountCreated) {
      _hideRegistering();
      if (! isAccountCreated) {
        _showUserNotCreated();
        gotoNextStepCallback(null);
        return;
      }

      gotoNextStepCallback(FxaModuleStates.SIGNUP_SUCCESS);
    });
  };

  return Module;

}());

