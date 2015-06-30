/* global LazyLoader, Form, FormUI */

'use strict';

require('/shared/test/unit/mocks/mock_l10n.js');
require('/shared/test/unit/load_body_html_helper.js');
require('/shared/js/lazy_loader.js');
require('/shared/elements/config.js');
require('/shared/js/component_utils.js');
require('/shared/elements/gaia_subheader/script.js');
require('/shared/elements/gaia-header/dist/gaia-header.js');



requireApp('communications/contacts/js/utilities/performance_helper.js');
require('/shared/js/l10n.js');
requireApp('communications/contacts/js/navigation.js');
requireApp('communications/contacts/services/contacts.js');
require('/shared/js/l10n_date.js');
require('/shared/js/contact_photo_helper.js');
require('/shared/js/contacts/utilities/templates.js');
requireApp('communications/contacts/js/contacts_tag.js');
requireApp('communications/contacts/js/tag_options.js');
require('/shared/js/text_normalizer.js');
require('/shared/js/contacts/import/utilities/status.js');
require('/shared/js/contacts/utilities/dom.js');
require('/shared/js/contacts/import/utilities/misc.js');

requireApp('communications/contacts/views/form/js/form_ui.js');

suite('FormUI', function() {

  var realMozL10n;
  suiteSetup(function(done) {

    realMozL10n = navigator.mozL10n;
    navigator.mozL10n = MockL10n;
    // Load HTML
    loadBodyHTML('/contacts/views/form/form.html');

    // Add hook to template to "head"
    var importHook = document.createElement('link');
    importHook.setAttribute('rel', 'import');
    importHook.setAttribute('href', '/contacts/elements/form.html');
    document.head.appendChild(importHook);

    // Fill the HTML
    LazyLoader.load([document.getElementById('view-contact-form')], function() {
      FormUI.init();
      done();
    });
  });

  suiteTeardown(function() {
    document.body.innerHTML = '';
    navigator.mozL10n = realMozL10n;
    realMozL10n = null;

  });

  setup(function() {

  });

  teardown(function() {

  });

  suite('Close button', function() {
    test(' > must dispatch an event when clicked', function(done) {
      window.addEventListener('close-ui', function() {
        done();
      });

      var clickEvent = new CustomEvent('action');
      document.querySelector('#contact-form-header').dispatchEvent(clickEvent);
    });
  });

  suite('Phone number', function() {
    test('foo', function() {
      assert.isTrue(true);
    });

    test('Tag selector is working', function() {
      assert.isTrue(true);
    });
  });

  suite('Photo', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  suite('Email', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  suite('Date', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  suite('Address', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  suite('Comment', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  suite('Save button', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });

  // Valid from activity #new and #update
  suite('Contact rendered properly', function() {
    test('foo', function() {
      assert.isTrue(true);
    });
  });
});
