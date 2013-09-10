'use strict';

require('/shared/test/unit/load_body_html_helper.js');
requireApp(
  'communications/ftu/test/unit/mock_navigator_moz_mobile_connection.js');
requireApp('communications/ftu/test/unit/mock_ui_manager.js');
requireApp('communications/ftu/test/unit/mock_icc_helper.js');
requireApp('communications/ftu/test/unit/mock_l10n.js');

requireApp('communications/ftu/js/sim_manager.js');

var _;
var mocksHelperForNavigation = new MocksHelper([
  'UIManager',
  'IccHelper'
]);
mocksHelperForNavigation.init();

suite('sim mgmt >', function() {
  var realL10n,
      realMozMobileConnection;
  var mocksHelper = mocksHelperForNavigation;
  var conn;

  setup(function() {
    // Load real html
    loadBodyHTML('/ftu/index.html');

    realMozMobileConnection = navigator.mozMobileConnection;
    navigator.mozMobileConnection = MockNavigatorMozMobileConnection;

    realL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;

    mocksHelper.setup();
    SimManager.init();
    conn = navigator.mozMobileConnection;
  });

  teardown(function() {
    navigator.mozMobileConnection = realMozMobileConnection;
    realMozMobileConnection = null;

    navigator.mozL10n = realL10n;
    realL10n = null;

    mocksHelper.teardown();
  });

  suiteSetup(function() {
    mocksHelper.suiteSetup();
  });

  suiteTeardown(function() {
    mocksHelper.suiteTeardown();
  });

  test('"Skip" hides the screen', function() {
    SimManager.skip();
    assert.isTrue(UIManager.activationScreen.classList.contains('show'));
    assert.isFalse(UIManager.unlockSimScreen.classList.contains('show'));
  });

  suite('Handle state changes', function() {
    suiteSetup(function() {
      SimManager._unlocked = false;
      conn.setProperty('retryCount', 3);
    });

    setup(function() {
      UIManager.unlockSimScreen.classList.remove('show');
    });

    teardown(function() {
      UIManager.unlockSimScreen.classList.remove('show');
    });

    suiteTeardown(function() {
      SimManager._unlocked = null;
      conn.setProperty('retryCount', null);
    });

    test('pinRequired shows PIN screen', function() {
      IccHelper.setProperty('cardState', 'pinRequired');
      SimManager.handleCardState();
      assert.isTrue(UIManager.unlockSimScreen.classList.contains('show'));
      assert.isFalse(UIManager.pinRetriesLeft.classList.contains('hidden'));
      assert.isFalse(UIManager.pukRetriesLeft.classList.contains('show'));
      assert.isFalse(UIManager.xckRetriesLeft.classList.contains('show'));
    });

    test('pukRequired shows PUK screen', function() {
      IccHelper.setProperty('cardState', 'pukRequired');
      SimManager.handleCardState();
      assert.isTrue(UIManager.unlockSimScreen.classList.contains('show'));
      assert.isFalse(UIManager.pukRetriesLeft.classList.contains('hidden'));
      assert.isFalse(UIManager.pinRetriesLeft.classList.contains('show'));
      assert.isFalse(UIManager.xckRetriesLeft.classList.contains('show'));
    });

    test('networkLocked shows XCK screen', function() {
      IccHelper.setProperty('cardState', 'networkLocked');
      SimManager.handleCardState();
      assert.isTrue(UIManager.unlockSimScreen.classList.contains('show'));
      assert.isFalse(UIManager.xckRetriesLeft.classList.contains('hidden'));
      assert.isFalse(UIManager.pinRetriesLeft.classList.contains('show'));
      assert.isFalse(UIManager.xckRetriesLeft.classList.contains('show'));
    });
  });

  suite('Unlocking', function() {
    setup(function() {
      SimManager._unlocked = false;
    });
    teardown(function() {
      SimManager._unlocked = false;
    });

    suite('PIN unlock ', function() {
      suiteSetup(function() {
        IccHelper.setProperty('cardState', 'pinRequired');
      });
      suiteTeardown(function() {
        IccHelper.setProperty('cardState', null);
      });

      test('too short PIN', function() {
        UIManager.pinInput.value = 123;
        SimManager.unlock();
        assert.isTrue(UIManager.pinInput.classList.contains('onerror'));
        assert.isFalse(UIManager.pinError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('too long PIN', function() {
        UIManager.pinInput.value = 123456789;
        SimManager.unlock();
        assert.isTrue(UIManager.pinInput.classList.contains('onerror'));
        assert.isFalse(UIManager.pinError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('all fields correct', function() {
        UIManager.pinInput.value = 1234;
        SimManager.unlock();
        assert.isFalse(UIManager.pinInput.classList.contains('onerror'));
        assert.isTrue(UIManager.pinError.classList.contains('hidden'));
        assert.isTrue(SimManager._unlocked);
        assert.isTrue(UIManager.activationScreen.classList.contains('show'));
        assert.isFalse(UIManager.unlockSimScreen.classList.contains('show'));
      });
    });

    suite('PUK unlock ', function() {
      suiteSetup(function() {
        IccHelper.setProperty('cardState', 'pukRequired');
      });
      suiteTeardown(function() {
        IccHelper.setProperty('cardState', null);
      });

      test('wrong length PUK', function() {
        UIManager.pukInput.value = 123;
        SimManager.unlock();
        assert.isTrue(UIManager.pukInput.classList.contains('onerror'));
        assert.isFalse(UIManager.pukError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('too short newPIN', function() {
        UIManager.pukInput.value = 12345678;
        UIManager.newpinInput.value = 123;
        SimManager.unlock();
        assert.isTrue(UIManager.newpinInput.classList.contains('onerror'));
        assert.isFalse(UIManager.newpinError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('too long newPIN', function() {
        UIManager.pukInput.value = 12345678;
        UIManager.newpinInput.value = 123456789;
        SimManager.unlock();
        assert.isTrue(UIManager.newpinInput.classList.contains('onerror'));
        assert.isFalse(UIManager.newpinError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('different PIN and confirm PIN', function() {
        UIManager.pukInput.value = 12345678;
        UIManager.newpinInput.value = 1234;
        UIManager.confirmNewpinInput.value = 4321;
        SimManager.unlock();
        assert.isTrue(UIManager.newpinInput.classList.contains('onerror'));
        assert.isTrue(UIManager.confirmNewpinInput.classList.contains(
                      'onerror'));
        assert.isFalse(UIManager.confirmNewpinError.classList.contains(
                       'hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('all fields correct', function() {
        UIManager.pukInput.value = 12345678;
        UIManager.newpinInput.value = 1234;
        UIManager.confirmNewpinInput.value = 1234;
        SimManager.unlock();
        assert.isFalse(UIManager.pukInput.classList.contains('onerror'));
        assert.isTrue(UIManager.pukError.classList.contains('hidden'));
        assert.isFalse(UIManager.newpinInput.classList.contains('onerror'));
        assert.isTrue(UIManager.newpinError.classList.contains('hidden'));
        assert.isFalse(UIManager.confirmNewpinInput.classList.contains(
                      'onerror'));
        assert.isTrue(UIManager.confirmNewpinError.classList.contains(
                       'hidden'));
        assert.isTrue(SimManager._unlocked);
        assert.isTrue(UIManager.activationScreen.classList.contains('show'));
        assert.isFalse(UIManager.unlockSimScreen.classList.contains('show'));
      });
    });

    suite('XCK unlock ', function() {
      suiteSetup(function() {
        IccHelper.setProperty('cardState', 'networkLocked');
      });
      suiteTeardown(function() {
        IccHelper.setProperty('cardState', null);
      });

      test('too short XCK', function() {
        UIManager.xckInput.value = 1234567;
        SimManager.unlock();
        assert.isTrue(UIManager.xckInput.classList.contains('onerror'));
        assert.isFalse(UIManager.xckError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('too long XCK', function() {
        UIManager.xckInput.value = 12345678901234567;
        SimManager.unlock();
        assert.isTrue(UIManager.xckInput.classList.contains('onerror'));
        assert.isFalse(UIManager.xckError.classList.contains('hidden'));
        assert.isFalse(SimManager._unlocked);
      });
      test('all fields correct', function() {
        UIManager.xckInput.value = 12345678;
        SimManager.unlock();
        assert.isFalse(UIManager.xckInput.classList.contains('onerror'));
        assert.isTrue(UIManager.xckError.classList.contains('hidden'));
        assert.isTrue(SimManager._unlocked);
        assert.isTrue(UIManager.activationScreen.classList.contains('show'));
        assert.isFalse(UIManager.unlockSimScreen.classList.contains('show'));
      });
    });
  });

  suite('No Telephony', function() {
    var realMozMobileConnection;

    setup(function() {
      realMozMobileConnection = navigator.mozMobileConnection;
      // no telephony API
      navigator.mozMobileConnection = null;

      SimManager.init();
    });

    teardown(function() {
      navigator.mozMobileConnection = realMozMobileConnection;
      realMozMobileConnection = null;
    });

    test('hide sim import section', function() {
      SimManager.skip();
      assert.isFalse(UIManager.simImport.classList.contains('show'));
    });
  });
});
