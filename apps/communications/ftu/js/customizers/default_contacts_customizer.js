'use strict';

var DefaultContactsCustomizer = {
  saveContacts: function(contacts) {
    for (var i = 0; i < contacts.length; ++i) {
      var contact = new mozContact();
      contact.init(contacts[i]);
      var savingContact = navigator.mozContacts.save(contact);
      savingContact.onerror = function errorHandler(error) {
        console.error('Saving default contact failed: ' + error);
        console.error('Error while saving ' + JSON.stringify(contact));
      };
    }
  },

  init: function() {
    if (!('mozContact' in window && 'mozContacts' in navigator)) {
      console.log('Contacts API not available');
      return;
    }

    var self = this;
    window.addEventListener('customization', function customize(event) {
      if (event.detail.setting == 'default_contacts') {
        window.removeEventListener('customization', customize);
        // Retrieve default contacts from the URI provide by
        // 'customization.json'
        var URI = event.detail.value;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', URI, true);
        xhr.overrideMimeType('application/json');
        xhr.responseType = 'json';
        xhr.onload = function() {
          if (xhr.status === 200) {
            self.saveContacts(xhr.response);
          } else {
            console.error('Failed to fetch file: ' + URI, xhr.statusText);
          }
        };
        try {
          xhr.send();
        } catch (e) {
          console.error('Failed to fetch file: ' + URI);
        }
      }
    });
  }
};

DefaultContactsCustomizer.init();
