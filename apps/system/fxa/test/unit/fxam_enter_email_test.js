'use strict';

require('/system/fxa/js/fxam_module.js');
require('/system/fxa/js/screens/fxam_enter_email.js');

suite('Firefox Accounts Enter Email Screen Suite', function() {

  test('Module integrity', function() {
    assert.isNotNull(FxaModuleEnterEmail);
  });

  test('init', function() {
    assert.isTrue(true);
  });

  test('onNext', function() {
    assert.isTrue(true);
  });

  test('onBack', function() {
    assert.isTrue(true);
  });

});

