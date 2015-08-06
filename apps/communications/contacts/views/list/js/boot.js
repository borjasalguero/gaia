/* global LazyLoader, ListUI, ListController, Cache, utils */
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
  utils.PerformanceHelper.domLoaded();
  Cache.apply('firstChunk');
  LazyLoader.load(['/shared/js/l10n.js',
    '/shared/js/l10n_date.js']).then(function() {
    // TODO Add if needed
  });
});

window.addEventListener('load', function() {
  utils.PerformanceHelper.visuallyComplete();

  var dependencies = [
    '/shared/js/contacts/import/utilities/misc.js',
    '/contacts/js/activities.js',
    '/shared/js/contact_photo_helper.js',
    '/shared/js/contacts/utilities/ice_store.js',
    '/contacts/js/utilities/ice_data.js',
    '/shared/js/contacts/utilities/image_loader.js',
    '/shared/js/tag_visibility_monitor.js',
    '/contacts/js/utilities/normalizer.js',
    '/shared/js/component_utils.js',
    '/contacts/services/contacts.js',
    '/contacts/js/header_ui.js',
    '/contacts/js/views/ice.js',
    '/shared/js/contacts/utilities/templates.js',
    '/shared/js/contacts/contacts_shortcuts.js',
    '/contacts/js/loader.js',
    '/shared/js/text_normalizer.js',
    '/shared/js/contacts/import/utilities/status.js',
    '/shared/js/contacts/utilities/dom.js',
    //TODO remove from here
    '/shared/js/confirm.js',
    document.getElementById('confirmation-message'),
    
    '/contacts/js/utilities/cookie.js',
    '/shared/js/contacts/import/utilities/config.js',
    '/shared/js/async_storage.js',
    '/shared/js/contacts/search.js',
    '/contacts/views/list/js/select_mode.js',
    '/contacts/views/list/js/list_controller.js',
    '/contacts/views/list/js/list_ui.js',
    '/contacts/views/list/js/list_utils.js',
    '/contacts/js/param_utils.js'
  ];

  navigator.mozL10n.once(() => {
    console.info('once');
  });
  navigator.mozL10n.ready(() => {
    console.info('ready');
  });

  LazyLoader.load(dependencies).then(function() {
    utils.PerformanceHelper.contentInteractive();
    utils.PerformanceHelper.chromeInteractive();

    function getParams() {
      var params = {};
      var raw = window.location.search.split('?')[1];
      if (!raw) {
        return {};
      }
      var pairs = raw.split('&');
      for (var i = 0; i < pairs.length; i++) {

        var data = pairs[i].split('=');
        params[data[0]] = data[1];
      }
      return params;
    }

    var params = getParams();
    ListUI.init(params.action);
    ListController.init();

    if (params.action && (params.action === 'delete' ||
      params.action === 'export')) {
      SelectMode.init(params);
    }

    navigator.mozSetMessageHandler(
      'activity',
      function(activity) {
        console.info(activity);
        ListController.setActivity(
          activity
        );
      }
    );
  });
});
