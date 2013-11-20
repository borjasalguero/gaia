'use strict';

require('/shared/test/unit/mocks/mock_lazy_loader.js');
requireApp('system/test/unit/mock_l10n.js');

suite('Firefox Accounts Enter Email Screen Suite', function() {

  var fakeNode,
      emailEl;

  var OverlayMock = {
    show: function() {
      this.wasDisplayed = true;
      this.isVisible = true;
    },
    hide: function() {
      this.isVisible = false;
    }
  };

  var ServerRequestMock = {
    checkEmail: function(email, onsuccess, onerror) {
      if (email === 'error@error.com') return onerror();
      onsuccess({
        registered: email !== 'newuser@newuser.com'
      });
    }
  };

  suiteSetup(function(done) {
    navigator.mozL10n = MockL10n;
    window.LazyLoader = MockLazyLoader;
    window.FxaModuleOverlay = Object.create(OverlayMock);
    window.FxaModuleErrorOverlay = Object.create(OverlayMock);
    window.FxModuleServerRequest = Object.create(ServerRequestMock);

    createDOM();

    emailEl = document.getElementById('fxa-email-input');

    require('/fxa/js/fxam_states.js');
    require('/fxa/view/view_login.js');
    require('/fxa/js/utils.js');
    require('/fxa/js/fxam_manager.js');
    require('/fxa/js/fxam_module.js');
    require('/fxa/js/fxam_navigation.js');
    require('/fxa/js/fxam_ui.js');
    require('/fxa/js/screens/fxam_enter_email.js', done);
  });

  test('Module integrity', function() {
    assert.isNotNull(FxaModuleEnterEmail);
  });

  test('init', function() {
    FxaModuleUI.init();
    FxaModuleEnterEmail.init();
  });

  test('onNext with no email address shows an error', function() {
    FxaModuleEnterEmail.onNext();
    assert.isTrue(FxaModuleErrorOverlay.wasDisplayed);
  });

  test('onNext with new address goes to set password', function(done) {
    emailEl.value = 'newuser@newuser.com';
    FxaModuleEnterEmail.onNext(function(nextState) {
      done();
    });
  });

  test('onNext with existing address goes to enter password', function(done) {
    emailEl.value = 'returning@returning.com';
    FxaModuleEnterEmail.onNext(function(nextState) {
      done();
    });
  });

  test('onNext with server error', function() {
    emailEl.value = 'error@error.com';
    FxaModuleEnterEmail.onNext();
  });

  test('onBack', function() {
    FxaModuleEnterEmail.onBack();
  });

  function createDOM() {
    fakeNode = document.createElement('div');
    fakeNode.innerHTML = [
      '<input type="email" id="fxa-email-input" />',
      '<button id="fxa-module-close"></button>',
      '<button id="fxa-module-next"></button>',
      '<button id="fxa-module-back"></button>',
      '<button id="fxa-module-done"></button>'
    ].join('');
    document.body.appendChild(fakeNode);
  }

});

