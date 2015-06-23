(function(exports) {
  'use strict';

  var _activity;
  const CONTACTS_APP_ORIGIN = location.origin;

  function close() {
    if (_activity) {
      _activity.postResult({});
    } else {
      window.history.back();
    }
  }

  function hasName(contact) {
    return (Array.isArray(contact.givenName) && contact.givenName[0] &&
              contact.givenName[0].trim()) ||
            (Array.isArray(contact.familyName) && contact.familyName[0] &&
              contact.familyName[0].trim());
  }


  var doMerge = function doMerge(contact, list, cb) {
    var callbacks = {
      success: cb,
      error: function(e) {
        console.error('Failed merging duplicate contacts: ', e.name);
        cb();
      }
    };

    LazyLoader.load('/contacts/js/utilities/merge_helper.js', function() {
      MergeHelper.merge(contact, list).then(callbacks.success, callbacks.error);
    });
  };

  function getCompleteName(contact) {
    var givenName = Array.isArray(contact.givenName) ?
                    contact.givenName[0] : '';

    var familyName = Array.isArray(contact.familyName) ?
                    contact.familyName[0] : '';

    var completeName = givenName && familyName ?
                       givenName + ' ' + familyName :
                       givenName || familyName;

    return completeName;
  }
  // Fills the contact data to display if no givenName and familyName
  function getDisplayName(contact) {
    if (hasName(contact)) {
      return { givenName: contact.givenName, familyName: contact.familyName };
    }

    var givenName = [];
    if (Array.isArray(contact.name) && contact.name.length > 0) {
      givenName.push(contact.name[0]);
    } else if (contact.org && contact.org.length > 0) {
      givenName.push(contact.org[0]);
    } else if (contact.tel && contact.tel.length > 0) {
      givenName.push(contact.tel[0].value);
    } else if (contact.email && contact.email.length > 0) {
      givenName.push(contact.email[0].value);
    } else {
      givenName.push(_('noName'));
    }

    return { givenName: givenName, modified: true };
  }

  var doMatch = function doMatch(contact, callbacks) {
    LazyLoader.load(['/shared/js/text_normalizer.js',
                     '/shared/js/simple_phone_matcher.js',
                     '/shared/js/contacts/contacts_matcher.js'], function() {
      Matcher.match(contact, 'active', callbacks);
    });
  };

  var mergeHandler;
  var cookMatchingCallbacks = function cookMatchingCallbacks(contact) {
    return {
      onmatch: function(results) {
        MatchService.showDuplicateContacts();

        mergeHandler = function mergeHandler(e) {
          if (e.origin !== CONTACTS_APP_ORIGIN) {
            return;
          }

          var data = e.data;
          switch (data.type) {
            case 'duplicate_contacts_loaded':
              // UI ready, passing duplicate contacts
              var duplicateContacts = {};
              Object.keys(results).forEach(function(id) {
                duplicateContacts[id] = {
                  matchingContactId: id,
                  matchings: results[id].matchings
                };
              });

              window.postMessage({
                type: 'show_duplicate_contacts',
                data: {
                  name: getCompleteName(getDisplayName(contact)),
                  duplicateContacts: duplicateContacts
                }
              }, CONTACTS_APP_ORIGIN);

            break;

            case 'merge_duplicate_contacts':
              window.removeEventListener('message', mergeHandler);

              // List of duplicate contacts to merge (identifiers)
              var list = [];
              var ids = data.data;
              Object.keys(ids).forEach(id => {
                list.push(results[id]);
              });

              doMerge(contact, list, function finished() {
                window.postMessage({
                  type: 'duplicate_contacts_merged',
                  data: ids
                }, CONTACTS_APP_ORIGIN);
                close();

              });

            break;

            case 'ready':
              // The list of duplicate contacts has been loaded
              Throbber.hide();
              break;

            case 'window_close':
              // If user igonores duplicate contacts we save the contact
              window.removeEventListener('message', mergeHandler);
              doSave(contact, true);
              break;
          }
        };

        window.addEventListener('message', mergeHandler);
      },
      onmismatch: function() {
        // Saving because there aren't duplicate contacts
        doSave(contact);
      }
    };
  };


  function doSave(contact) {
    ContactsService.addListener('contactchange', function oncontactchange(event) {
      sessionStorage.setItem('contactID', event.contactID);
      sessionStorage.setItem('reason', event.reason);
      ContactsService.removeListener('contactchange', oncontactchange);
      close();
    });
    ContactsService.save(contact, function(error) {
        });
  }

  exports.Form = {
    init: function() {
      window.addEventListener('close-ui', function() {
        close();
      });

      document.addEventListener('save-contact', function(event) {
        var contact = utils.misc.toMozContact(event.detail);
        ContactsService.addListener('contactchange', function oncontactchange(event) {
          sessionStorage.setItem('contactID', event.contactID);
          sessionStorage.setItem('reason', event.reason);
          ContactsService.removeListener('contactchange', oncontactchange);
          close();
        });

        var callbacks = cookMatchingCallbacks(contact);
        doMatch(contact, callbacks);
      });
    },
    setActivity: function(activity) {
      _activity = activity;
    }
  };
}(window));
