/* global LazyLoader, FormUI, FormController */
'use strict';

/*
 * This class is the one in charge of loading the minimum set of
 * resources needed for the view to load. Any other JS/CSS/Element
 * not needed in the critical path *must* be lazy loaded when needed.
 *
 * Once localization and all the basic JS/CSS/Elements are loaded,
 * we will initialize UI and Controller. Both JS classes *must* be
 * independent and will communicate through events.
 */

window.addEventListener('DOMContentLoaded', function() {
  LazyLoader.load([
    '/shared/js/l10n.js'], function() {
    LazyLoader.load([
      document.getElementById('settings-wrapper'),
      '/shared/elements/gaia_switch/script.js'
    ], function() {
      // TODO Add if needed
    });
  });
});

window.addEventListener('load', function() {
  var dependencies = [
    // '/shared/elements/gaia_switch/script.js'
    // '/contacts/js/navigation.js',
    // '/contacts/services/contacts.js',
    // '/shared/js/l10n_date.js',
    // '/shared/js/contact_photo_helper.js',
    // '/shared/js/contacts/utilities/templates.js',
    // '/contacts/js/contacts_tag.js',
    // '/contacts/js/tag_options.js',
    // '/shared/js/text_normalizer.js',
    // '/shared/js/contacts/import/utilities/status.js',
    // '/shared/js/contacts/utilities/dom.js',
    // '/shared/js/contacts/import/utilities/misc.js',
    '/contacts/views/settings/js/settings_ui.js',
    '/contacts/views/settings/js/settings_controller.js'
    // '/contacts/views/form/js/main_navigation.js'
  ];

  LazyLoader.load(
    dependencies,
    function() {
      SettingsUI.init();
      SettingsController.init();
      // navigator.mozSetMessageHandler(
      //   'activity',
      //   function(activity) {
      //     FormController.setActivity(
      //       activity
      //     );
      //     FormUI.render(
      //       activity.source.data.params
      //     );
      //   }
      // );
    }
  );
});
