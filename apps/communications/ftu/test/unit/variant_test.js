'use strict';

require('/shared/test/unit/mocks/mock_lazy_loader.js');
requireApp('communications/ftu/test/unit/mock_icc_helper.js');
requireApp('communications/ftu/test/unit/mock_navigator_moz_settings.js');
requireApp('communications/ftu/js/resources.js');
requireApp('communications/ftu/js/variant.js');

var baseDir = '/ftu/test/unit';
var customizationFullPath, realSettings;
var mocksHelperForVariant = new MocksHelper(['IccHelper', 'LazyLoader']);
mocksHelperForVariant.init();
mocksHelperForVariant.attachTestHelpers();
suite(' Customizer > ', function() {
  const TEST_NETWORK_MCC = 214;
  const TEST_NETWORK_MNC = 7;

  suiteSetup(function() {
    realSettings = navigator.mozSettings;
    navigator.mozSettings = MockNavigatorSettings;
    MockIccHelper.mProps['iccInfo'] = {
      mcc: TEST_NETWORK_MCC,
      mnc: TEST_NETWORK_MNC
    };
    customizationFullPath = baseDir + VariantManager.customizationFile;
    VariantManager.init();
  });

  suiteTeardown(function() {
    navigator.mozSettings = realSettings;
    realSettings = null;
    MockIccHelper.mProps['iccInfo'] = null;
  });

  test(' normalize ', function() {
    assert.equal(VariantManager.normalizeCode('7'), '007');
    assert.equal(VariantManager.normalizeCode('07'), '007');
    assert.equal(VariantManager.normalizeCode('007'), '007');
  });

  test(' getMccMnc ', function() {
    assert.equal(VariantManager.getMccMnc(), '214-007');
  });

  test(' dispatchCustomizationEvents ', function(done) {
    Resources.load(customizationFullPath, 'json',
      function(variantCustomization) {
        window.addEventListener('customization', function customizer(event) {
          window.removeEventListener('customization', customizer);
          var firstEvent =
            Object.keys(variantCustomization[VariantManager.getMccMnc()])[0];
          assert.equal(event.detail.setting, firstEvent);
          done();
        });
        VariantManager.dispatchCustomizationEvents(variantCustomization);
      }, function() {
        assert.ok(false, 'Test:Error retrieving customization.json');
      }
    );
  });
});
