'use strict';

requireApp('communications/ftu/test/unit/mock_navigator_contacts.js');
requireApp('communications/ftu/js/customizers/customizer.js');
requireApp('communications/ftu/js/customizers/default_contacts_customizer.js');


suite('Default contacts customizer >', function() {
  var realMozContacts, realMozContact, saveContactSpy;
  var contactsMockup = [
    {'givenName': ['Foo']},
    {'givenName': ['Bar']}
  ];

  suiteSetup(function() {
    realMozContacts = navigator.mozContacts;
    navigator.mozContacts = MockNavigatorContacts;
    saveContactSpy = sinon.spy(MockNavigatorContacts, 'save');
  });

  suiteTeardown(function() {
    navigator.mozContacts = realMozContacts;
    realMozContacts = null;
    saveContactSpy.restore();
  });

  setup(function() {
    saveContactSpy.reset();
  });

  test(' set ', function() {
    defaultContactsCustomizer.set(contactsMockup);
    // As contactsMockup has 2 contacts, this method
    // should be called twice
    assert.equal(saveContactSpy.callCount, 2);
  });
});
