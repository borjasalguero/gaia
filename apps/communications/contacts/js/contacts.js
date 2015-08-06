'use strict';
/* global ActivityHandler */
/* global Cache */
/* global contacts */
/* global DeferredActions */
/* global fb */
/* global fbLoader */
/* global LazyLoader */
/* global MainNavigation */
/* global Loader */
/* global TAG_OPTIONS */
/* global utils */
/* global GaiaHeader */
/* global GaiaSubheader */
/* global HeaderUI */
/* global Search */
/* global ContactsService */
/* global ParamUtils */

/* exported COMMS_APP_ORIGIN */
/* exported SCALE_RATIO */

/* jshint nonew: false */

var COMMS_APP_ORIGIN = location.origin;

// Scale ratio for different devices
var SCALE_RATIO = window.devicePixelRatio || 1;

var Contacts = (function() {

  var goToForm = function edit() {
    var transition = ActivityHandler.currentlyHandling ? 'activity-popup'
                                                       : 'fade-in';
    MainNavigation.go('view-contact-form', transition);
  };

  var settingsReady = false;
  var detailsReady = false;
  var formReady = false;

  var currentContact = {};

  var contactsList;
  var contactsDetails;
  var contactsForm;

  // Shows the edit form for the current contact being in an update activity
  // It receives an array of two elements with the facebook data && values
  function showEditForm(facebookData, params) {
    contactsForm.render(currentContact, goToForm,
                        facebookData, params.fromUpdateActivity);
  }

  var addExtrasToContact = function addExtrasToContact(extrasString) {
    try {
      var extras = JSON.parse(decodeURIComponent(extrasString));
      for (var type in extras) {
        var extra = extras[type];
        if (currentContact[type]) {
          if (Array.isArray(currentContact[type])) {
            var joinArray = currentContact[type].concat(extra);
            currentContact[type] = joinArray;
          } else {
            currentContact[type] = extra;
          }
        } else {
          currentContact[type] = Array.isArray(extra) ? extra : [extra];
        }
      }
    } catch (e) {
      console.error('Extras malformed');
      return null;
    }
  };

  var loadDeferredActions = function loadDeferredActions() {
    window.removeEventListener('listRendered', loadDeferredActions);
    LazyLoader.load([
      'js/deferred_actions.js',
      '/contacts/js/fb_loader.js',
      '/contacts/js/fb/fb_init.js'
    ], function() {
      DeferredActions.execute();
    });
  };

  var contactListClickHandler = function originalHandler(id) {

    if (!ActivityHandler.currentlyHandling) {
      window.location.href = ParamUtils.generateUrl('detail', {contact:id});
      return;
    }

    ContactsService.get(id, function findCb(contact) {
      currentContact = contact;
      if (ActivityHandler.currentActivityIsNot(['import'])) {
        if (ActivityHandler.currentActivityIs(['pick'])) {
          ActivityHandler.dataPickHandler(currentContact);
        }
        return;
      }

      window.location.href = ParamUtils.generateUrl('detail', {contact:id});
    });
  };

  var handleBack = function handleBack(cb) {
    MainNavigation.back(cb);
  };

  var handleCancel = function handleCancel() {
    //If in an activity, cancel it
    if (ActivityHandler.currentlyHandling) {
      ActivityHandler.postCancel();
      MainNavigation.home();
    } else {
      handleBack(function() {
        // TODO: remove all interaction with detail.js when it works
        // as an independent view
        if (MainNavigation.currentView() === 'view-contact-details') {
          contactsDetails.startNFC(currentContact);
        }
      });
    }
  };

  var showAddContact = function showAddContact() {
    window.location.href = ParamUtils.generateUrl('form',{action: 'new'});
  };

  var loadFacebook = function loadFacebook(callback) {
    LazyLoader.load([
      '/contacts/js/fb_loader.js',
      '/contacts/js/fb/fb_init.js'
    ], () => {
      if (!fbLoader.loaded) {
        fb.init(function onInitFb() {
          window.addEventListener('facebookLoaded', function onFbLoaded() {
            window.removeEventListener('facebookLoaded', onFbLoaded);
            callback();
          });
          fbLoader.load();
        });
      } else {
        callback();
      }
    });
  };

  var initForm = function c_initForm(callback) {
    if (formReady) {
      callback();
    } else {
      initDetails(function onDetails() {
        LazyLoader.load([
          '/shared/js/contacts/import/utilities/misc.js',
          '/shared/js/contacts/utilities/image_thumbnail.js',
          '/contacts/js/match_service.js'],
        function() {
          Loader.view('Form', function viewLoaded() {
            formReady = true;
            contactsForm = contacts.Form;
            contactsForm.init(TAG_OPTIONS);
            callback();
          });
        });
      });
    }
  };

  var initSettings = function c_initSettings(callback) {
    if (settingsReady) {
      callback();
    } else {
      Loader.view('Settings', function viewLoaded() {
        LazyLoader.load(['/contacts/js/utilities/sim_dom_generator.js',
          '/contacts/js/utilities/normalizer.js',
          '/shared/js/contacts/import/utilities/misc.js',
          '/shared/js/mime_mapper.js',
          '/shared/js/contacts/import/utilities/vcard_parser.js',
          '/contacts/js/utilities/icc_handler.js',
          '/shared/js/contacts/import/utilities/sdcard.js',
          '/shared/elements/gaia_switch/script.js',
          '/shared/js/date_time_helper.js'], function() {
          settingsReady = true;
          contacts.Settings.init();
          callback();
        });
      });
    }
  };

  var initDetails = function c_initDetails(callback) {
    if (detailsReady) {
      callback();
    } else {
      Loader.view('Details', function viewLoaded() {
        LazyLoader.load(
          ['/shared/js/contacts/import/utilities/misc.js',
           '/dialer/js/telephony_helper.js',
           '/shared/js/contacts/sms_integration.js',
           '/shared/js/contacts/contacts_buttons.js',
           '/contacts/js/match_service.js'],
        function() {
          detailsReady = true;
          contactsDetails = contacts.Details;
          contactsDetails.init();
          callback();
        });
      });
    }
  };

  var showForm = function c_showForm(edit, contact) {
    currentContact = contact || currentContact;
    initForm(function onInit() {
      doShowForm(edit);
    });
  };

  var doShowForm = function c_doShowForm(edit) {
    var contact = edit ? currentContact : null;

    if (contact && fb.isFbContact(contact)) {
      var fbContact = new fb.Contact(contact);
      var req = fbContact.getDataAndValues();

      req.onsuccess = function() {
        contactsForm.render(contact, goToForm, req.result);
      };

      req.onerror = function() {
        contactsForm.render(contact, goToForm);
      };
    }
    else {
      contactsForm.render(contact, goToForm);
    }
  };

  var setCurrent = function c_setCurrent(contact) {
    currentContact = contact;

    if (contacts.Details) {
      contacts.Details.setContact(contact);
    }
  };

  var onOverlayShown = function c_onOverlayShown() {
    // When we are showing the overlay we are often performing other
    // significant work, such as importing.  While performing this work
    // it would be nice to avoid the overhead of any accidental reflows
    // due to touching the list DOM.  For example, importing incrementally
    // adds contacts to the list which triggers many reflows.  Therefore,
    // minimize this impact by hiding the list while we are showing the
    // overlay.
    contacts.List.hide();
  };

  var onOverlayHidden = function c_onOverlayHidden() {
    contacts.List.show();
  };

  var showSettings = function showSettings() {
    initSettings(function onSettingsReady() {
      // The number of FB Friends has to be recalculated
      contacts.Settings.refresh();
      MainNavigation.go('view-settings', 'fade-in');
    });
  };

  var stopPropagation = function stopPropagation(evt) {
    evt.preventDefault();
  };

  var close = function close() {
    window.removeEventListener('localized', initContacts);
  };

  LazyLoader.load('/shared/js/l10n.js', () => {
    navigator.mozL10n.once(() => {
      initContacts();
    });
    navigator.mozL10n.ready(() => {
      Cache.maybeEvict();
    });
    LazyLoader.load('/shared/js/l10n_date.js');
  });

  window.addEventListener('DOMContentLoaded', function onLoad() {
    window.removeEventListener('DOMContentLoaded', onLoad);
  });

  sessionStorage.setItem('contactChanges', null);
  window.addEventListener('pageshow', function onPageshow() {
    // XXX: Workaround until the platform will be fixed
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1184953
    document.registerElement(
      'gaia-header',
      { prototype: GaiaHeader.prototype }
    );
    document.registerElement(
      'gaia-subheader',
      { prototype: GaiaSubheader.prototype }
    );

    // XXX: As well we need to get back the theme color
    // due to the bug with back&forward cache mentioned before
    var meta = document.querySelector('meta[name="theme-color"]');
    document.head.removeChild(meta);
    meta = document.createElement('meta');
    meta.content = 'var(--header-background)';
    meta.name = 'theme-color';
    document.head.appendChild(meta);

    // #new handling
    var eventsStringified = sessionStorage.getItem('contactChanges');
    if (!eventsStringified || eventsStringified === 'null') {
      return;
    }
    
    var changeEvents = JSON.parse(eventsStringified);
    for (var i = 0; i < changeEvents.length; i++) {
      performOnContactChange(changeEvents[i]);
    }
    sessionStorage.setItem('contactChanges', null);
  });

  window.addEventListener('overlayshown', onOverlayShown);
  window.addEventListener('overlayhidden', onOverlayHidden);

  return {
    'goBack' : handleBack,
    'cancel': handleCancel,
    'setCurrent': setCurrent,
    'showContactDetail': contactListClickHandler,
    'updateContactDetail': updateContactDetail,
    'loadFacebook': loadFacebook,
    'close': close,
    get asyncScriptsLoaded() {
      return loadAsyncScriptsDeferred.promise;
    }
  };
})();
