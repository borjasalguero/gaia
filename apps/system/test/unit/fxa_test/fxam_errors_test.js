'use strict';

requireApp('/system/test/unit/mock_l10n.js');
requireApp('system/fxa/js/utils.js');
requireApp('system/fxa/js/fxam_module.js');
requireApp('system/fxa/js/fxam_errors.js');

suite('Error manager', function() {
  var errorsObject = {
    'CANNOT_CREATE_ACCOUNT': 'cannot-create',
    'RESET_PASSWORD_ERROR': 'reset-password-error',
    'INVALID_ACCOUNTID': 'invalid-email',
    'INVALID_PASSWORD': 'invalid-password',
    'INTERNAL_ERROR_NO_CLIENT': 'generic-error',
    'ALREADY_SIGNED_IN_USER': 'already-signed-in',
    'INTERNAL_ERROR_INVALID_USER': 'generic-error',
    'SERVER_ERROR': 'generic-error',
    'NO_TOKEN_SESSION': 'generic-error',
    'GENERIC_ERROR': 'generic-error'
  };
  var errors, response;
  var realL10n;
  suiteSetup(function() {
    errors = Object.keys(errorsObject);
    realL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;
  });

  suiteTeardown(function() {
    errors = null;
    navigator.mozL10n = realL10n;
  });

  var l10nSpy;
  setup(function() {
    response = {};
    l10nSpy = this.sinon.spy(navigator.mozL10n, 'get');
  });

  teardown(function() {
    response = null;
    l10nSpy.null;
  });

  test('Can not create account error', function() {
    response.error = 'CANNOT_CREATE_ACCOUNT';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title'
    ));
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Can not reset password', function() {
    response.error = 'RESET_PASSWORD_ERROR';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(
      l10nSpy.calledWith('fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Invalid account ID', function() {
    response.error = 'INVALID_ACCOUNTID';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(
      l10nSpy.calledWith('fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Invalid password', function() {
    response.error = 'INVALID_PASSWORD';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Internal error, no client', function() {
    response.error = 'INTERNAL_ERROR_NO_CLIENT';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('There is a user already signed', function() {
    response.error = 'ALREADY_SIGNED_IN_USER';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Internal error, invalid user', function() {
    response.error = 'INTERNAL_ERROR_INVALID_USER';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Server error', function() {
    response.error = 'SERVER_ERROR';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('There is no token', function() {
    response.error = 'NO_TOKEN_SESSION';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });

  test('Generic error', function() {
    response.error = 'GENERIC_ERROR';
    FxaModuleErrors.responseToParams(response);

    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-title')
    );
    assert.ok(l10nSpy.calledWith(
      'fxa-' + errorsObject[response.error] + '-message')
    );
  });
});
