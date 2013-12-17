'use strict';

requireApp('communications/ftu/js/resources.js');
requireApp('communications/ftu/js/customizers/customizer.js');
requireApp('communications/ftu/js/customizers/ringtone_customizer.js');
requireApp('communications/ftu/test/unit/mock_navigator_moz_settings.js');

suite('RingtoneCustomizer >', function() {
  var ringtoneParams = { uri: '/ftu/test/unit/resources/ringtone.ogg',
                         name: 'ringtone' };
  var createLockSpy, realSettings, resourcesSpy;

  suiteSetup(function() {
    realSettings = navigator.mozSettings;
    navigator.mozSettings = MockNavigatorSettings;
    createLockSpy = sinon.spy(MockNavigatorSettings, 'createLock');
//    resourcesSpy = sinon.spy(Resources, "load")
  });

  suiteTeardown(function() {
    navigator.mozSettings = realSettings;
    realSettings = null;
    createLockSpy.restore();
  });

  setup(function() {
    createLockSpy.reset();
  });

/*  test(' set > ', function() {
    ringtoneCustomizer.set(ringtoneParams);
    assert.isTrue(resourcesSpy.calledOnce);
    assert.equal(ringtoneParams.uri, resourcesSpy.getCall(0).args[0]);
    assert.equal('blob', resourcesSpy.getCall(0).args[1]);
  });*/

  test(' tes > ', function() {
    var stub = sinon.stub(Resources, 'load').yields();
    ringtoneCustomizer.set(ringtoneParams);
    assert.isTrue(createLockSpy.calledOnce);
  });
});
