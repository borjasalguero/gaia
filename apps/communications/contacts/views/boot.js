window.addEventListener('DOMContentLoaded', function() {
  LazyLoader.load([
    '/shared/js/l10n.js'], function() {
    LazyLoader.load([
      document.getElementById('view-contact-form')
    ], function() {
      // TODO Add if needed
    });
  });
});


window.onload = function() {
  var dependencies = [
    '/contacts/services/contacts.js',
    '/shared/js/contacts/utilities/event_listeners.js',
    // '/contacts/js/views/list.js',
    '/shared/js/l10n_date.js',
    '/shared/js/async_storage.js',
    '/shared/js/contacts/import/utilities/config.js',
    '/contacts/js/utilities/extract_params.js',
    '/contacts/js/utilities/cookie.js',
    '/shared/js/contact_photo_helper.js',
    '/shared/js/l10n_date.js',
    '/shared/js/contacts/utilities/templates.js',
    '/shared/js/contacts/contacts_shortcuts.js',
    '/contacts/js/contacts_tag.js',
    '/contacts/js/tag_options.js',
    '/shared/js/text_normalizer.js',
    '/shared/js/contacts/import/utilities/status.js',
    '/shared/js/contacts/utilities/dom.js',
    '/shared/js/contacts/import/utilities/misc.js',
    '/shared/js/contacts/import/utilities/vcard_reader.js',
    '/shared/js/contacts/import/utilities/vcard_parser.js',
    '/shared/js/contacts/import/utilities/misc.js',
    '/shared/js/contacts/import/import_status_data.js',
    '/shared/pages/import/js/parameters.js',
    '/shared/js/fb/fb_request.js',
    '/shared/js/contacts/import/facebook/fb_data.js',
    '/shared/js/contacts/import/facebook/fb_utils.js',
    '/shared/js/contacts/import/facebook/fb_query.js',
    '/shared/js/fb/fb_reader_utils.js',
    '/shared/js/contacts/import/facebook/fb_contact_utils.js',
    '/shared/js/contacts/import/facebook/fb_contact.js',
    '/contacts/js/fb/fb_link.js',
    '/contacts/js/fb/fb_messaging.js',
    '/contacts/js/fb_loader.js',
    '/contacts/js/fb/fb_init.js',
    '/contacts/js/deferred_actions.js',
    '/shared/js/contacts/import/utilities/misc.js',
    '/shared/js/contacts/utilities/image_thumbnail.js'
  ];

  LazyLoader.load(
    dependencies,
    function() {
      fbLoader.load();
      LazyLoader.load(
        [
          '/contacts/js/service_extensions.js',
          '/contacts/views/form_basic.js'
        ],
        function() {
          navigator.mozSetMessageHandler(
            'activity',
            function(activity) {
              Form.setActivity(
                activity
              );
              Form.render(
                activity.source.data.params
              );
            }
          );
        }
      );
    }
  );
};
