'use strict';

/* global Details */
/* global ContactsButtons */

/* exported DetailsUI */

(function(exports) {

  var contacts = window.contacts || {};
  var photoPos = 7;
  var initMargin = 8;
  var DEFAULT_TEL_TYPE = 'other';
  // Scale ratio for different devices
  var SCALE_RATIO = window.devicePixelRatio || 1;

  var socialButtonIds = [
    '#profile_button',
    '#wall_button',
    '#msg_button',
    '#link_button'
  ];

  var DetailsUI = {
    init: function(currentContact, readOnly) {
      this._ = navigator.mozL10n.get;
      this.header = document.querySelector('#details-view-header');
      this.contactDetails = document.querySelector('#contact-detail');
      this.listContainer = document.querySelector('#details-list');
      this.detailsName = document.querySelector('#contact-name-title');
      this.detailsNameText = document.querySelector('#contact-name-title bdi');
      this.orgTitle = document.querySelector('#org-title');
      this.datesTemplate = document.querySelector('#dates-template-\\#i\\#');
      this.addressesTemplate =
        document.querySelector('#address-details-template-\\#i\\#');
      this.duplicateTemplate =
        document.querySelector('#duplicate-contacts-template');
      this.editContactButton = document.querySelector('#edit-contact-button');
      this.cover = document.querySelector('#cover-img');
      this.detailsInner = document.querySelector('#contact-detail-inner');
      this.favoriteMessage = document.querySelector('#toggle-favorite');
      this.notesTemplate =
        document.querySelector('#note-details-template-\\#i\\#');
      this.socialTemplate = document.querySelector('#social-template-\\#i\\#');

      this.addListeners();

      this.render(currentContact, readOnly);
    },

    addListeners: function() {
      this.initPullEffect(this.cover);

      utils.listeners.add({
        '#toggle-favorite': this.toggleFavorite.bind(this),
        '#details-view-header': [
          {
            event: 'action',
            handler: Details.handleBackAction
          }
        ],
        '#edit-contact-button': Details.handleEditAction
      });

      ContactsButtons.init(this.listContainer, this.contactDetails,
        ActivityHandler);
    },

    initPullEffect: function(cover) {
      var maxPosition = Math.round(150 * SCALE_RATIO);
      var startPosition = 0;
      var self = this;

      function onTouchStart(e) {
        if (self.contactDetails.classList.contains('no-photo')) {
          return;
        }
        e.preventDefault();
        startPosition = e.changedTouches[0].clientY;

        self.contactDetails.classList.add('up');
        cover.classList.add('up');

        window.addEventListener('touchmove', onTouchMove, true);
        window.addEventListener('touchend', onTouchEnd, true);
      }

      function onTouchEnd(e) {
        e.preventDefault();

        self.contactDetails.style.transform = null;
        self.contactDetails.classList.add('up');

        cover.style.transform = null;
        cover.classList.add('up');

        window.removeEventListener('touchmove', onTouchMove, true);
        window.removeEventListener('touchend', onTouchEnd, true);
      }

      function onTouchMove(e) {
        e.preventDefault();

        var deltaY = e.changedTouches[0].clientY - startPosition;
        deltaY = Math.min(maxPosition, Math.max(0, deltaY));

        var calc = 'calc(' + initMargin + 'rem + ' + deltaY + 'px)';
        self.contactDetails.style.transform = 'translateY(' + calc + ')';
        self.contactDetails.classList.remove('up');

        // Divide by 40 (4 times slower and in rems)
        var coverPosition = (-photoPos + (deltaY / 40)) + 'rem';
        cover.style.transform = 'translateY(' + coverPosition + ')';
        cover.classList.remove('up');
      }

      cover.addEventListener('touchstart', onTouchStart, true);
    },

    render: function (currentContact, readOnly) {
      if(this.isAFavoriteChange){
        this.isAFavoriteChange = false;
        return Promise.resolve(this.isAFavoriteChange);
      }

      this.dispatchEvent('renderinit');

      this.contactData = currentContact || this.contactData;

      // Initially enabled and only disabled if necessary
      this.editContactButton.removeAttribute('disabled');
      this.editContactButton.classList.remove('hide');
      this.header.setAttribute('action', 'back');

      if (readOnly) {
        this.editContactButton.classList.add('hide');
        this.header.setAttribute('action', 'close');
      }

      this.doReloadContactDetails(this.contactData);
    },

    doReloadContactDetails: function(contact) {
      var name = this.getDisplayName(contact);
      this.detailsNameText.textContent = name
      this.contactDetails.classList.remove('no-photo');
      this.contactDetails.classList.remove('up');
      utils.dom.removeChildNodes(this.listContainer);

      this.renderFavorite(contact);
      this.renderOrg(contact);

      ContactsButtons.renderPhones(contact);
      ContactsButtons.renderEmails(contact);

      this.renderWebrtcClient(contact);

      this.renderAddresses(contact);

      this.renderDates(contact);

      this.renderNotes(contact);

      this.renderSocial(contact);

      this.renderDuplicate(contact);

      this.renderPhoto(contact);

      /* Render for pinned the web */

      document.querySelector('meta[property="og:name"').content = name;

      if (contact.tel && contact.tel.length && contact.tel.length > 0) {
        document.querySelector('meta[property="og:telephone"').content = contact.tel[0].value;
      }
      if (contact.email && contact.email.length && contact.email.length > 0) {
        document.querySelector('meta[property="og:email"').content = contact.email[0].value;
      }

      this.dispatchEvent('renderdone');
    },

    dispatchEvent: function(name) {
      window.dispatchEvent(new CustomEvent(name));
    },

    getDisplayName: function(contact) {
      var name = this._('noName');

      if (this.hasName(contact)) {
        name = contact.name[0];
      } else if (this.hasContent(contact.tel)) {
        name = contact.tel[0].value;
      } else if (this.hasContent(contact.email)) {
        name = contact.email[0].value;
      }
      return name;
    },

    hasContent: function(field) {
      return (Array.isArray(field) &&
              field.length > 0 &&
              field[0].value &&
              field[0].value.trim());
    },

    hasName: function(contact) {
      return (Array.isArray(contact.name) &&
              contact.name[0] &&
              contact.name[0].trim());
    },

    renderFavorite: function(contact) {
      var favorite = Details.isFavorite(contact);
      this.toggleFavoriteMessage(favorite);

      this.header.classList.toggle('favorite', !!favorite);
    },

    toggleFavorite: function() {
      var contact = this.contactData;

      var favorite = !Details.isFavorite(contact);
      this.toggleFavoriteMessage(favorite);

      // Disabling button while saving the contact
      this.favoriteMessage.style.pointerEvents = 'none';
      Details.toggleFavorite(contact).then(savedContact => {
         this.favoriteMessage.style.pointerEvents = 'auto';
         this.setContact(savedContact);
         this.renderFavorite(savedContact);
         this.isAFavoriteChange = true;
      });
    },

    toggleFavoriteMessage: function(isFav) {
      var cList = this.favoriteMessage.classList;
      var l10nId = isFav ? 'removeFavorite' : 'addFavorite';
      this.favoriteMessage.setAttribute('data-l10n-id', l10nId);
      isFav ? cList.add('on') : cList.remove('on');
    },

    setContact: function(currentContact) {
      this.contactData = currentContact;
    },

    renderOrg: function(contact) {
      if (contact.org && contact.org.length > 0 && contact.org[0] !== '') {
        this.orgTitle.textContent = contact.org[0];
        this.orgTitle.classList.remove('hide');
      } else {
        this.orgTitle.classList.add('hide');
        this.orgTitle.textContent = '';
      }
    },

    renderWebrtcClient: function(contact) {
      WebrtcClient.start(contact);
    },

    renderAddresses: function(contact) {
      if (!contact.adr) {
        return;
      }

      // Load what we need
      LazyLoader.load('/contacts/js/utilities/mozContact.js', () => {
        for (var i = 0; i < contact.adr.length; i++) {
          var currentAddress = contact.adr[i];
          // Sanity check
          if (utils.mozContact.haveEmptyFields(currentAddress,
              ['streetAddress', 'postalCode', 'locality', 'countryName'])) {
            continue;
          }
          var address = currentAddress.streetAddress || '';
          var escapedStreet = Normalizer.escapeHTML(address, true);
          var locality = currentAddress.locality;
          var escapedLocality = Normalizer.escapeHTML(locality, true);
          var escapedType = Normalizer.escapeHTML(currentAddress.type, true);
          var country = currentAddress.countryName || '';
          var escapedCountry = Normalizer.escapeHTML(country, true);
          var postalCode = currentAddress.postalCode || '';
          var escapedPostalCode = Normalizer.escapeHTML(postalCode, true);

          var addressField = {
            streetAddress: escapedStreet,
            postalCode: escapedPostalCode,
            locality: escapedLocality || '',
            countryName: escapedCountry,
            type: this._(escapedType) || escapedType ||
              TAG_OPTIONS['address-type'][0].value,
            'type_l10n_id': currentAddress.type,
            i: i
          };
          var template = utils.templates.render(this.addressesTemplate,
            addressField);
          this.listContainer.appendChild(template);
        }
      });
    },

    renderDates: function(contact) {
      if (!contact.bday && !contact.anniversary) {
        return;
      }

      var dateString = '';

      var fields = ['bday', 'anniversary'];
      var l10nIds = ['birthday', 'anniversary'];

      var rendered = 0;
      for (var j = 0; j < fields.length; j++) {
        var value = contact[fields[j]];
        if (!value) {
          continue;
        }
        try {
          dateString = utils.misc.formatDate(value);
        } catch (err) {
          console.error('Error parsing date');
          continue;
        }
        var element = utils.templates.render(this.datesTemplate, {
          i: ++rendered,
          date: dateString,
          type: this._(l10nIds[j])
        });

        this.listContainer.appendChild(element);
      }
    },

    renderNotes: function(contact) {
      if (!contact.note || contact.note.length === 0) {
        return;
      }
      var container = document.createElement('li');
      var title = document.createElement('h2');
      title.setAttribute('data-l10n-id', 'comments');
      container.appendChild(title);
      for (var i = 0; i < contact.note.length; i++) {
        var currentNote = contact.note[i];
        var noteField = {
          note: Normalizer.escapeHTML(currentNote, true) || '',
          i: i
        };
        var template = utils.templates.render(this.notesTemplate, noteField);
        container.appendChild(template);
        this.listContainer.appendChild(container);
      }
    },

    renderSocial: function(contact) {
      var social = utils.templates.render(this.socialTemplate, {});
      var shareButton = social.querySelector('#share_button');

      shareButton.addEventListener('click',
        Details.shareContact.bind(null, this.contactData));

      socialButtonIds.forEach(function check(id) {
        var button = social.querySelector(id);
        if (button) {
          button.classList.add('hide');
        }
      });

      shareButton.classList.remove('hide');

      this.listContainer.appendChild(social);
    },

    renderDuplicate: function(contact) {
      var dupItem = utils.templates.render(this.duplicateTemplate, {});
      var findMergeButton = dupItem.querySelector('#find-merge-button');
      findMergeButton.disabled = true;

      Details.getCount().then(count => {
        if (count > 1) {
          // Only have this active if contact list has more than one entry
          findMergeButton.disabled = false;
          console.info('here');
          findMergeButton.addEventListener('click',
            Details.findDuplicate.bind(null, this.contactData.id));
        }
      });

      this.listContainer.appendChild(dupItem);
    },

    renderPhoto: function(contact) {
      this.contactDetails.classList.remove('up');

      var photo = ContactPhotoHelper.getFullResolution(contact);
      if (photo) {
        var currentHash = this.cover.dataset.imgHash;
        if (!currentHash) {
          utils.dom.updatePhoto(photo, this.cover);
          this.updateHash(photo, this.cover);
        }
        else {
          // Need to recalculate the hash and see whether the images changed
          Details.calculateHash(photo, newHash => {
            if (currentHash !== newHash) {
              utils.dom.updatePhoto(photo, cover);
              this.cover.dataset.imgHash = newHash;
            }
            else {
              // Only for testing purposes
              this.cover.dataset.photoReady = 'true';
            }
          });
        }

        this.contactDetails.classList.add('up');
        this.cover.classList.add('translated');
        this.contactDetails.classList.add('translated');
        var clientHeight = this.contactDetails.clientHeight -
            (initMargin * 10 * SCALE_RATIO);
        if (this.detailsInner.offsetHeight < clientHeight) {
          this.cover.style.overflow = 'hidden';
        } else {
          this.cover.style.overflow = 'auto';
        }
      } else {
        this.resetPhoto();
      }
    },

    updateHash: function(photo, cover) {
      Details.calculateHash(photo, function(hash) {
        cover.dataset.imgHash = hash;
      });
    },

    resetPhoto: function() {
      this.cover.classList.remove('translated');
      this.contactDetails.classList.remove('translated');
      this.cover.style.backgroundImage = '';
      this.cover.style.overflow = 'auto';
      this.contactDetails.style.transform = '';
      this.contactDetails.classList.add('no-photo');
      this.cover.dataset.imgHash = '';
    }
  };

  exports.DetailsUI = DetailsUI;

})(window);