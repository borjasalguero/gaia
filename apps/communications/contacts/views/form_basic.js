'use strict';
/* global ContactPhotoHelper */
/* global ContactsTag */
/* global fb */
/* global LazyLoader */
/* global MozActivity */
/* global Normalizer */
/* global ContactsService */
/* global utils */
/* global TAG_OPTIONS */
/* global ActionMenu */
/* global MergeHelper */
/* global Matcher */
/* exported Form */

(function(exports) {
  // Keep the number of relevant inputs filled.
  var counters = {
    'tel': 0,
    'email': 0,
    'adr': 0,
    'date': 0,
    'note': 0
  };

  // Object for handling the upper progress bar.
  var Throbber = (function() {
    var throbberDOM = document.getElementById('throbber');
    return {
      show: function() {
        throbberDOM.classList.remove('hide');
      },
      hide: function() {
        throbberDOM.classList.add('hide');
      }
    };
  })();

  // Activity if needed
  var _activity;

  // Configuration for handling all templates involved
  // in the form.
  var configs = {
    'tel': {
      template: document.getElementById('add-phone-#i#'),
      tags: TAG_OPTIONS['phone-type'],
      fields: ['value', 'type', 'carrier'],
      container: document.getElementById('contacts-form-phones')
    },
    'email': {
      template: document.getElementById('add-email-#i#'),
      tags: TAG_OPTIONS['email-type'],
      fields: ['value', 'type'],
      container: document.getElementById('contacts-form-emails')
    },
    'adr': {
      template: document.getElementById('add-address-#i#'),
      tags: TAG_OPTIONS['address-type'],
      fields: [
        'type',
        'streetAddress',
        'postalCode',
        'locality',
        'countryName'
      ],
      container: document.getElementById('contacts-form-addresses')
    },
    'date': {
      template: document.getElementById('add-date-#i#'),
      tags: TAG_OPTIONS['date-type'],
      fields: ['value', 'type'],
      container: document.getElementById('contacts-form-dates')
    },
    'note': {
      template: document.getElementById('add-note-#i#'),
      tags: TAG_OPTIONS['address-type'],
      fields: ['note'],
      container: document.getElementById('contacts-form-notes')
    }
  };

  var close = function() {
    if (_activity) {
      window.close();
    }
    window.history.back();
  };

  var contactForm,
      thumb,
      thumbAction,
      saveButton,
      formHeader,
      givenName,
      familyName,
      _,
      formView,
      mergeHandler,
      currentPhoto = null;

  var INVALID_CLASS = 'invalid';

  // Remove icon button id
  var IMG_DELETE_CLASS = 'img-delete-button';

  // The size we want our contact photos to be
  var PHOTO_WIDTH = 320;
  var PHOTO_HEIGHT = 320;

  // bug 1038414: ask for an image about 2MP before
  // doing the crop to save memory in both apps
  var MAX_PHOTO_SIZE = 200000;

  var touchstart = 'ontouchstart' in window ? 'touchstart' : 'mousedown';

  var textFieldsCache = {
    _textFields: null,

    get: function textFieldsCache_get() {
      if (!this._textFields) {
        var fields = contactForm.querySelectorAll('input[data-field]');
        var invalidFields =
          Array.slice(contactForm.querySelectorAll(
                                                '.invalid input[data-field]'));

        this._textFields = Array.filter(fields, function(field) {
          return (invalidFields.indexOf(field) === -1);
        });
      }

      return this._textFields;
    },

    clear: function textFieldsCache_clear() {
      this._textFields = null;
    }
  };

  var initContainers = function cf_initContainers() {
    thumb = document.querySelector('#thumbnail-photo');
    thumbAction = document.querySelector('#thumbnail-action');
    thumbAction.querySelector('#photo-button').onclick = photoAction;
    saveButton = document.querySelector('#save-button');
    contactForm = document.getElementById('contact-form');
    formHeader = document.querySelector('#contact-form-header');
    givenName = document.getElementById('givenName');
    familyName = document.getElementById('familyName');
    formView = document.getElementById('view-contact-form');
  };

  var init = function cf_init() {
    // Cache l10n funciton
    _ = navigator.mozL10n.get;
    // Cache all elements
    initContainers();
    // In every input we will update the status of the 'save' button
    document.addEventListener('input', function input(event) {
      updateSaveButtonStatus();
    });

    contactForm.addEventListener(touchstart, function click(event) {
      var tgt = event.target;
      if (tgt.tagName == 'BUTTON' && tgt.getAttribute('type') == 'reset') {
        event.preventDefault();
        var input = tgt.previousElementSibling;

        if (input.getAttribute('name').startsWith('tel') &&
            input.dataset.field === 'value') {
          var telId = input.id;
          var telIndex = telId.substring(telId.indexOf('_') + 1);
          var carrierField =
                        document.getElementById('carrier' + '_' + telIndex);
          carrierField.parentNode.classList.add(INVALID_CLASS);

          textFieldsCache.clear();
        }
        input.value = '';
        updateSaveButtonStatus();
      }
    });

    thumbAction.addEventListener(touchstart, function click(event) {
      // Removing current photo
      if (event.target.tagName == 'BUTTON') {
        saveButton.removeAttribute('disabled');
      }
    });

    formView.addEventListener('ValueModified', function onValueModified(event) {
      if (!event.detail) {
        return;
      }

      if (!emptyForm() && event.detail.prevValue !== event.detail.newValue) {
        saveButton.removeAttribute('disabled');
      }
    });

    // Add listeners
    utils.listeners.add({
      '#contact-form-header': [
        {
          event: 'action',
          handler: close
        }
      ],
      '#save-button': saveContact,
      '#contact-form button[data-field-type]': newField
    });
  };

   // Renders the birthday as per the locale
  function renderDate(date, bdayInputText) {
    if (!date) {
      return;
    }

    bdayInputText.textContent = utils.misc.formatDate(date);
    bdayInputText.classList.remove('placeholder');
  }

  function onInputDate(bdayInputText, e) {
    renderDate(e.target.valueAsDate, bdayInputText);
  }

  var newField = function newField(evt) {
    onNewFieldClicked(evt);
  };

  function extractValue(value) {
    if (value) {
      if (Array.isArray(value) && value.length > 0 && value[0]) {
        return value[0].trim();
      } else if (!Array.isArray(value)) {
        return value.trim();
      }
    }

    return '';
  }

  function fillDates(contact) {
    if (contact.bday) {
      contact.date = [];

      contact.date.push({
        type: 'birthday',
        value: contact.bday
      });
    }

    if (contact.anniversary) {
      contact.date = contact.date || [];
      contact.date.push({
        type: 'anniversary',
        value: contact.anniversary
      });
    }
  }

  function renderPhoto(contact) {
    if (contact.photo && contact.photo.length > 0) {
      currentPhoto = ContactPhotoHelper.getFullResolution(contact);
      var button = addRemoveIconToPhoto();
    }

    utils.dom.updatePhoto(currentPhoto, thumb);
  }

  var render = function render(params) {
    givenName.value = extractValue(params.givenName);
    familyName.value = extractValue(params.lastName || params.familyName);
    renderPhoto(params);

    // Completo el params con el formato correcto de fechas
    fillDates(params);

    // Render all params given (JUST THE PARAMS GIVEN)
    ['tel', 'email', 'adr', 'date', 'note'].forEach(function(field) {
      params[field] && renderTemplate(field, params[field]);
    });
    // Check if button 'save' must be disabled or not
    updateSaveButtonStatus();
  };


  // template, fields, cont, counter
  /**
   * Render Template
   *
   * @param {string} type Type of template, eg. 'tel'
   * @param {object[]} toRender
   */
  var renderTemplate = function cf_rendTemplate(type, toRender) {
    if (!Array.isArray(toRender)) {
      toRender = [{value: toRender}];
    }

    for (var i = 0; i < toRender.length; i++) {
      insertField(type, toRender[i] || {});
    }
  };

  var onNewFieldClicked = function onNewFieldClicked(evt) {
    var type = evt.target.dataset.fieldType;
    evt.preventDefault();
    // Workaround until 809452 is fixed.
    // What we are avoiding with this condition is removing / restoring
    // a field when the event is simulated by a ENTER Keyboard click
    if (evt.explicitOriginalTarget === evt.target) {
        insertField(type, null, [
          'inserted',
          'displayed'
        ]);
    }
    textFieldsCache.clear();
    return false;
  };

  function checkCarrierTel(carrierInput, event) {
    var telInput = event.target;
    var value = telInput.value;

    if (!value || !value.trim()) {
      // If it was not previously filled then it will be disabled
      if (!telInput.dataset.wasFilled) {
        carrierInput.setAttribute('disabled', 'disabled');
      }
      else {
        // Otherwise marked as invalid in order not to submit it
        carrierInput.parentNode.classList.add(INVALID_CLASS);
        textFieldsCache.clear();
      }
    }
    else {
      // Marked as filled
      telInput.dataset.wasFilled = true;
      // Enabling and marking as valid
      carrierInput.removeAttribute('disabled');
      carrierInput.parentNode.classList.remove(INVALID_CLASS);
    }
  }

  /**
   * We cannot relay on the counter, but in the next id after the
   * last field.
   * See bug 1113134 for related explanation.
   */
  function getNextTemplateId(container) {
    var nodes = container.childNodes;
    if (!nodes || nodes.length === 0) {
      return 0;
    }

    var lastNode = nodes[nodes.length - 1];
    var value = lastNode.dataset.index;
    return value ? parseInt(value) + 1 : 0;
  }

  var insertField = function insertField(type, object, targetClasses) {
    if (!type || !configs[type]) {
      console.error('Inserting field with unknown type');
      return;
    }
    var obj = object || {};
    var config = configs[type];
    var template = config.template;
    var tags = ContactsTag.filterTags(type, null, config.tags);

    var container = config.container;

    var default_type = tags[0] && tags[0].type || '';
    var currField = {};

    config.fields.forEach(function(currentElem) {
      var def = (currentElem === 'type') ? default_type : '';
      var defObj = (typeof(obj) === 'string') ? obj : obj[currentElem];
      var value = '';
      var isDate = (defObj && typeof defObj.getMonth === 'function');

      currField[currentElem] = (defObj && typeof(defObj) === 'object' &&
                                      !isDate ? defObj.toString() : defObj);
      value = currField[currentElem] || def;
      if (currentElem === 'type') {
        currField.type_value = value;

        // Do localization for built-in types
        if (isBuiltInType(value, tags)) {
          currField.type_l10n_id = value;
          value = _(value) || value;
        }
      }
      if (!isDate) {
        currField[currentElem] = Normalizer.escapeHTML(value, true);
      }
    });
    currField.i = getNextTemplateId(container);

    var rendered = utils.templates.render(template, currField);
    // Controlling that if no tel phone is present carrier field is disabled
    if (type === 'tel') {
      var carrierInput = rendered.querySelector('input[data-field="carrier"]');
      var telInput = rendered.querySelector('input[data-field="value"]');

      var cb = checkCarrierTel.bind(null, carrierInput);

      telInput.addEventListener('input', cb, true);

      checkCarrierTel(carrierInput, {target: telInput});
    }

    // Adding listener to properly render dates
    if (type === 'date') {
      var dateInput = rendered.querySelector('input[type="date"]');

      // Setting the max value as today's date
      var currentDate = new Date();
      dateInput.setAttribute('max', currentDate.getFullYear() + '-' +
                             (currentDate.getMonth() + 1) + '-' +
                             currentDate.getDate());

      var dateInputText = dateInput.previousElementSibling;
      if (currField.value) {
        dateInput.valueAsDate = currField.value;
        renderDate(currField.value, dateInputText);
      }
      else {
        dateInputText.setAttribute('data-l10n-id', 'date-span-placeholder');
      }

      dateInput.addEventListener('input',
        onInputDate.bind(null, dateInputText));
    }

    var removeEl = removeFieldIcon(rendered.id, type);
    rendered.insertBefore(removeEl, rendered.firstChild);

    // Add event listeners
    var boxTitle = rendered.querySelector('legend.action');
    if (boxTitle) {
      boxTitle.addEventListener('click', onGoToSelectTag);
    }

    // This will happen when the fields are added by the user on demand
    if (Array.isArray(targetClasses)) {
      rendered.classList.add(targetClasses[0]);
      window.setTimeout(() => rendered.classList.add(targetClasses[1]));
    }

    container.classList.remove('empty');
    container.appendChild(rendered);
    counters[type]++;
  };

  var onGoToSelectTag = function onGoToSelectTag(evt) {
    evt.preventDefault();
    window.Contacts && Contacts.goToSelectTag(evt);
    return false;
  };

  var fillContact = function(contact, done) {
    createName(contact);

    getPhones(contact);
    getEmails(contact);
    getAddresses(contact);
    getNotes(contact);
    getDates(contact);

    if (!currentPhoto) {
      done(contact);
      return;
    }

    utils.thumbnailImage(currentPhoto, function gotTumbnail(thumbnail) {
      if (currentPhoto !== thumbnail) {
        contact.photo = [currentPhoto, thumbnail];
      } else {
        contact.photo = [currentPhoto];
      }
      done(contact);
    });
  };

  var saveContact = function saveContact() {
    // Block the save button
    saveButton.setAttribute('disabled', 'disabled');

    // Show the progress bar
    Throbber.show();

    // Create the contact to store
    var myContact = {
      additionalName: [''],
      name: ['']
    };

    var inputs = { givenName, familyName };
    for (var field in inputs) {
      var value = inputs[field].value;
      if (value && value.length > 0) {
        myContact[field] = [value];
      } else {
        myContact[field] = null;
      }
    }

    fillContact(myContact, function contactFilled(myContact) {
      var contact = utils.misc.toMozContact(myContact);
      fbLoader.load();
      LazyLoader.load(
        [
          '/contacts/js/service_extensions.js'
        ],
        function() {
          var callbacks = cookMatchingCallbacks(contact);
          doMatch(contact, callbacks);
        }
      );
    });
  }

  var cookMatchingCallbacks = function cookMatchingCallbacks(contact) {
    return {
      onmatch: function(results) {
        ExtServices.showDuplicateContacts();

        mergeHandler = function mergeHandler(e) {
          if (e.origin !== fb.CONTACTS_APP_ORIGIN) {
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
              }, fb.CONTACTS_APP_ORIGIN);

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
                if (!_activity) {
                  window.postMessage({
                    type: 'duplicate_contacts_merged',
                    data: ids
                  }, fb.CONTACTS_APP_ORIGIN);

                  setTimeout(function() {
                    // alert(window.history.length);
                    window.history.go(-1);
                  }, 1000);

                } else {
                  _activity.postResult({ contact: contact });
                }
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

  var doMatch = function doMatch(contact, callbacks) {
    LazyLoader.load(['/shared/js/text_normalizer.js',
                     '/shared/js/simple_phone_matcher.js',
                     '/shared/js/contacts/contacts_matcher.js'], function() {
      Matcher.match(contact, 'active', callbacks);
    });
  };

  var doSave = function doSave(contact, noTransition) {
    // Deleting auxiliary objects created for dates
    delete contact.date;

    // When we add new contact, it has no id at the beginning. We have one, if
    // we edit current contact. We will use this information below.
    var isNew = contact.id !== 'undefined';

    if (!_activity) {
      ContactsService.addListener('contactchange', function oncontactchange(event) {
        sessionStorage.setItem('contactID', event.contactID);
        sessionStorage.setItem('reason', event.reason);
        ContactsService.removeListener('contactchange', oncontactchange);
        window.history.back();
      });
    }

    ContactsService.save(
      utils.misc.toMozContact(contact),
      function(e) {
        if (e) {
          Throbber.hide();
          console.error('Error saving contact', e);
          return;
        }
        Throbber.hide();
        // Sent the success of the activity
        if (!_activity) {
          return;
        }
        _activity.postResult({contact: contact});
      }
    );
  };

  /**
   * Creates a complete name from the received contact's `givenName` and
   * `familyName` fields.
   *
   * @param {object} contact MozContactObject to process
   */
  var createName = function createName(contact) {
    var givenName = '', familyName = '';

    if (Array.isArray(contact.givenName)) {
      givenName = contact.givenName[0].trim();
    }

    if (Array.isArray(contact.familyName)) {
      familyName = contact.familyName[0].trim();
    }

    var completeName = (givenName + ' ' + familyName).trim();
    contact.name = completeName ? [completeName] : [];
  };

  function isBuiltInType(type, tagList) {
    return tagList.some(function(tag) {
      return tag.type === type;
    });
  }

  var getPhones = function getPhones(contact) {
    var selector = '#view-contact-form form div.phone-template:not(.facebook)';
    var phones = document.querySelectorAll(selector);
    for (var i = 0; i < phones.length; i++) {
      var currentPhone = phones[i];
      var index = currentPhone.dataset.index;
      var numberField = document.getElementById('number_' + index);
      var value = numberField.value;
      if (!value) {
        continue;
      }

      var type = [document.getElementById('tel_type_' + index).dataset.value || ''];
      var carrierSelector = 'carrier_' + index;
      var carrier = document.getElementById(carrierSelector).value || '';
      contact.tel = contact.tel || [];
      /*jshint -W075 */
      contact.tel.push({ value, type, carrier });
    }
  };

  var getEmails = function getEmails(contact) {
    var selector = '#view-contact-form form div.email-template:not(.facebook)';
    var emails = document.querySelectorAll(selector);
    for (var i = 0; i < emails.length; i++) {
      var currentEmail = emails[i];
      var index = currentEmail.dataset.index;
      var emailField = document.getElementById('email_' + index);
      var value = emailField.value;
      value = value && value.trim();
      if (!value) {
        continue;
      }

      var type = [
        document.getElementById('email_type_' + index).dataset.value || ''];
      contact.email = contact.email || [];
      contact.email.push({ value, type });
    }
  };

  var getDates = function getDate(contact) {
    var selector = '#view-contact-form form div.date-template';
    var dates = document.querySelectorAll(selector);
    var bdayVal = null, anniversaryVal = null;

    for (var i = 0; i < dates.length; i++) {
      var currentDate = dates[i];
      var arrayIndex = currentDate.dataset.index;
      var dateField = document.getElementById('date_' + arrayIndex);
      var dateValue = dateField.valueAsDate;

      selector = 'date_type_' + arrayIndex;
      var type = document.getElementById(selector).dataset.value || '';
      if (!dateValue || !type) {
        continue;
      }

      // Date value is referred to current TZ but it is not needed to normalize
      // as that will be done only when the date is presented to the user
      // by calculating the corresponding offset
      switch (type) {
        case 'birthday':
          bdayVal = dateValue;
        break;
        case 'anniversary':
          anniversaryVal = dateValue;
        break;
      }
    }

    contact.bday = bdayVal;
    contact.anniversary = anniversaryVal;
  };

  var getAddresses = function getAddresses(contact) {
    var selector =
                '#view-contact-form form div.address-template:not(.facebook)';
    var addresses = document.querySelectorAll(selector);
    for (var i = 0; i < addresses.length; i++) {
      var currentAddress = addresses[i];
      var arrayIndex = currentAddress.dataset.index;
      var addressField = document.getElementById('streetAddress_' + arrayIndex);
      var addressValue = addressField.value || '';
      addressValue = addressValue.trim();
      selector = 'address_type_' + arrayIndex;
      var typeField = document.getElementById(selector).dataset.value || '';
      typeField = typeField.trim();
      selector = 'locality_' + arrayIndex;
      var locality = document.getElementById(selector).value || '';
      locality = locality.trim();
      selector = 'postalCode_' + arrayIndex;
      var postalCode = document.getElementById(selector).value || '';
      postalCode = postalCode.trim();
      selector = 'countryName_' + arrayIndex;
      var countryName = document.getElementById(selector).value || '';
      countryName = countryName.trim();

      // Sanity check for pameters, check all params but the typeField
      if (addressValue === '' && locality === '' &&
          postalCode === '' && countryName === '') {
        continue;
      }

      contact.adr = contact.adr || [];
      contact.adr.push({
        streetAddress: addressValue,
        postalCode: postalCode,
        locality: locality,
        countryName: countryName,
        type: [typeField]
      });
    }
  };

  var getNotes = function getNotes(contact) {
    var selector = '#view-contact-form form div.note-template';
    var notes = document.querySelectorAll(selector);
    for (var i = 0; i < notes.length; i++) {
      var currentNote = notes[i];
      var arrayIndex = currentNote.dataset.index;
      var noteField = document.getElementById('note_' + arrayIndex);
      var noteValue = noteField.value;
      noteValue = noteValue && noteValue.trim();
      if (!noteValue) {
        continue;
      }

      contact.note = contact.note || [];
      contact.note.push(noteValue);
    }
  };

  var updateSaveButtonStatus = function updateSaveButtonStatus() {
    var saveButton = document.getElementById('save-button');
    if (emptyForm()) {
      saveButton.setAttribute('disabled', 'disabled');
    } else {
      saveButton.removeAttribute('disabled');
    }
  };

  var emptyForm = function emptyForm() {
    var textFields = textFieldsCache.get();
    for (var i = textFields.length - 1; i >= 0; i--) {
      if ((textFields[i].value && textFields[i].value.trim()) ||
          (textFields[i].valueAsDate)) {
        return false;
      }
    }
    return true;
  };

  var removeFieldIcon = function removeFieldIcon(selector, type) {
    var delButton = document.createElement('button');

    delButton.className = IMG_DELETE_CLASS; // + ' fillflow-row-action';
    delButton.setAttribute('data-l10n-id', 'removeField');
    delButton.setAttribute('data-type', type);

    delButton.onclick = function removeElement(event) {
      // Workaround until 809452 is fixed.
      // What we are avoiding with this condition is removing / restoring
      // a field when the event is simulated by a ENTER Keyboard click
      if (event.clientX === 0 && event.clientY === 0) {
        return false;
      }
      event.preventDefault();
      var container = configs[type].container;
      var elem = document.getElementById(selector);

      if (type !== 'photo') {
        elem.parentNode.removeChild(elem);
        if (container.querySelectorAll('[data-field]').length === 0) {
          container.classList.add('empty');
        }
      }
      else {
        // TODO: Implement the new delete image flow
        console.warn('Delete image');
      }

      // Update the aria label for acessibility
      var delButton = event.target;
      delButton.setAttribute('data-l10n-id', 'removeField');

      counters[type]--;
      textFieldsCache.clear();
      updateSaveButtonStatus();
    };

    return delButton;
  };

  var addRemoveIconToPhoto = function cf_addRemIconPhoto() {
    var out = thumbAction.querySelector('button.' + IMG_DELETE_CLASS);
    if (!out) {
      out = removeFieldIcon(thumbAction.id, 'photo');
      thumbAction.appendChild(out);
    }
    else {
      // Ensure it is visible
      out.classList.remove('hide');
    }
    thumbAction.classList.add('with-photo');

    return out;
  };

  function canRemovePhoto() {
    var out = currentPhoto !== null;
    return out;
  }

  function photoAction() {
    if (canRemovePhoto()) {
      removeOrUpdatePhoto();
    }
    else {
      pickImage();
    }
  }

  function removeOrUpdatePhoto() {
    LazyLoader.load('/contacts/js/action_menu.js', function() {
      var prompt = new ActionMenu('photo-options');
      prompt.addToList({id: 'remove-photo'}, removePhoto);

      prompt.addToList({id: 'change-photo'}, pickImage);

      prompt.show();
    });
  }

  function removePhoto() {
    currentPhoto = null;
    thumbAction.classList.remove('with-photo');
    utils.dom.updatePhoto(null, thumb);

    if (!emptyForm()) {
      saveButton.removeAttribute('disabled');
    }
  }

  var pickImage = function pickImage() {
    var activity = new MozActivity({
      name: 'pick',
      data: {
        type: 'image/jpeg',
        maxFileSizeBytes: MAX_PHOTO_SIZE
      }
    });

    activity.onsuccess = function success() {
      addRemoveIconToPhoto();
      if (!emptyForm()) {
        saveButton.removeAttribute('disabled');
      }
      // XXX
      // this.result.blob is valid now, but it won't stay valid
      // (see https://bugzilla.mozilla.org/show_bug.cgi?id=806503)
      // And it might not be the size we want, anyway, so we make
      // our own copy that is at the right size.
      resizeBlob(
        this.result.blob,
        PHOTO_WIDTH,
        PHOTO_HEIGHT,
        function(resized) {
          utils.dom.updatePhoto(resized, thumb);
          currentPhoto = resized;
        }
      );
    };

    activity.onerror = function() {
      window.console.error('Error in the activity', activity.error);
    };

    return false;
  };

  function resizeBlob(blob, target_width, target_height, callback) {
    var img = document.createElement('img');
    var url = URL.createObjectURL(blob);
    img.src = url;

    function cleanupImg() {
      img.src = '';
      URL.revokeObjectURL(url);
    }

    img.onerror = cleanupImg;

    img.onload = function() {
      var image_width = img.width;
      var image_height = img.height;
      var scalex = image_width / target_width;
      var scaley = image_height / target_height;
      var scale = Math.min(scalex, scaley);

      var w = target_width * scale;
      var h = target_height * scale;
      var x = (image_width - w) / 2;
      var y = (image_height - h) / 2;

      var canvas = document.createElement('canvas');
      canvas.width = target_width;
      canvas.height = target_height;
      var context = canvas.getContext('2d', { willReadFrequently: true });

      context.drawImage(img, x, y, w, h, 0, 0, target_width, target_height);
      cleanupImg();
      canvas.toBlob(function(resized) {
        context = null;
        canvas.width = canvas.height = 0;
        canvas = null;
        callback(resized);
      } , 'image/jpeg');
    };
  }

  function setActivity(activity) {
    _activity = activity;
  }

  exports.Form = {
    'init': init,
    'render': render,
    'setActivity': setActivity
  };
}(window));

Form.init();
