/**
 * Module checks the validity of an email address, and if valid,
 * determine which screen to go to next.
 */



FxaModuleEnterEmail = (function() {
  'use strict';


  var _ = null;

  function _isEmailValid(emailEl) {
    return emailEl && emailEl.value && emailEl.validity.valid;
  }

  function _loadSignIn(done) {
    done(FxaModuleStates.ENTER_PASSWORD);
  }

  function _loadSignUp(done) {
    done(FxaModuleStates.SET_PASSWORD);
  }

  function _enableNext(module, emailEl) {
    if (_isEmailValid(emailEl)) {
      module.nextButton.removeAttribute('disabled');
    } else {
      module.nextButton.setAttribute('disabled', 'disabled');
    }
  }

  var Module = Object.create(FxaModule);
  Module.init = function() {
    _ = navigator.mozL10n.get;
    this.initNav();
    // Cache HTML elements

    this.importElements('fxa-email-input');

    // Blocks the navigation until check the condition
    _enableNext(this, this.fxaEmailInput);

    // Add listeners
    var self = this;
    this.fxaEmailInput.addEventListener(
      'input',
      function onInput(event) {
        _enableNext(self, event.target);
      }, false
    );
  };

  Module.refresh = function refresh(options) {
    if (options.email)
      this.fxaEmailInput.value = options.email;
  };

  Module.onNext = function onNext(gotoNextStepCallback) {
    FxaModuleOverlay.show(_('fxa-connecting-to-firefox'));

    var email = this.fxaEmailInput.value;

    var self = this;
    FxModuleServerRequest.checkEmail(
      email,
      function onServerResponse(response) {
        FxaModuleOverlay.hide();
        FxaModuleManager.setParam('email', email);
        if (response.registered) {
          _loadSignIn(gotoNextStepCallback);
        } else {
          _loadSignUp(gotoNextStepCallback);
        }
      },
      function onNetworkError() {
        FxaModuleOverlay.hide();
        FxaModuleErrorOverlay.show(
          _('fxa-checking-email-error-title'),
          _('fxa-checking-email-error-message'));
      }
    );
  };

  return Module;

}());

FxaModuleEnterEmail.init();
