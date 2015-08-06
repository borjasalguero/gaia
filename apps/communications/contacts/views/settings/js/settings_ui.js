'use strict';
/* global Cache */
/* global Contacts */
/* global IccHandler */
/* global LazyLoader */
/* global navigationStack */
/* global utils */
/* global Settings */
/* global contacts */

/***
 This class handles all the activity regarding
 the settings screen for contacts
 **/
(function(exports) {

  var navigationHandler,
    importSettingsHeader,
    orderCheckBox,
    orderItem,
    importSettingsPanel,
    importSettingsTitle,
    importOptions,
    exportOptions,
    importLiveOption,
    importGmailOption,
    importSDOption,
    exportSDOption;

  //////////////////////////////////////////////////

  var doneButton,
    importContacts,
    exportContacts,
    setICEButton,
    bulkDeleteButton,
    orderByLastName,
    newOrderByLastName = null;

  function cacheElements() {
    doneButton = document.getElementById('settings-close');
    importContacts = document.getElementById('importContacts');
    exportContacts = document.getElementById('exportContacts');
    setICEButton = document.getElementById('set-ice');
    bulkDeleteButton = document.getElementById('bulkDelete');
    document.querySelector('#settings-article').dataset.state = 'fb-disabled';
    orderItem = document.getElementById('settingsOrder');
    orderCheckBox = orderItem.querySelector('[name="order.lastname"]');
    importSettingsHeader = document.getElementById('import-settings-header');

    // Creating a navigation handler from this view
    navigationHandler = new navigationStack('view-settings');

    // Init panel & elements for caching them
    importSettingsPanel = document.getElementById('import-settings');
    importSDOption = document.getElementById('import-sd-option');
    exportSDOption = document.getElementById('export-sd-option');
    importSettingsTitle = document.getElementById('import-settings-title');
    importLiveOption = document.getElementById('import-live-option');
    importGmailOption = document.getElementById('import-gmail-option');

    /*
     * Adding listeners
     */

    // Listener for updating the timestamp based on extServices
    window.addEventListener('message', function updateList(e) {
      if (e.data.type === 'import_updated') {
        updateTimestamps();
        checkNoContacts();
      }
    });
  }

  //Close

  var closeHandler = function closeHandler() {
    window.dispatchEvent(new Event('close-ui'));
  }

  //Order

  var onOrderingChange = function onOrderingChange(evt) {
    newOrderByLastName = orderCheckBox.checked;
    if(newOrderByLastName !== orderByLastName){
      sessionStorage.setItem('orderchange', true);
    } else {
      sessionStorage.setItem('orderchange', null);
    }
    utils.cookie.update({order: newOrderByLastName});
    updateOrderingUI();
    Cache.evict();
  };

  //Import

  var importHandler = function importHandler() {
    importSettingsPanel.classList.remove('export');
    importSettingsPanel.classList.add('import');
    updateImportTitle('importContactsTitle');
    navigationHandler.go('import-settings', 'right-left');
  }

  var updateImportTitle = function updateImportTitle(l10nString) {
    importSettingsTitle.setAttribute('data-l10n-id', l10nString);
  };

  //Export

  var exportHandler = function exportHandler() {
    // Hide elements for import and transition
    LazyLoader.load(['/contacts/js/export/contacts_exporter.js'], loadSearch);

    function loadSearch() {
      importSettingsPanel.classList.remove('import');
      importSettingsPanel.classList.add('export');
      updateImportTitle('exportContactsTitle');
      navigationHandler.go('import-settings', 'right-left');
    }
  }

  //ICE

  var iceHandler = function iceHandler() {
    showICEScreen();
  }

  function showICEScreen(cb) {
    LazyLoader.load([
      '/contacts/js/utilities/ice_data.js',
      '/contacts/js/views/ice_settings.js',
      '/shared/js/contacts/utilities/ice_store.js'], function(){
      contacts.ICE.refresh();
      navigationHandler.go('ice-settings', 'right-left');
      if (typeof cb === 'function') {
        cb();
      }
    });
  }

  //Delete

  var deleteHandler = function deleteHandler() {
    window.dispatchEvent(new Event('delete-ui'));
  }

  var importSettingsBackHandler = function importSettingsBackHandler() {
    navigationHandler.back(function navigateBackHandler() {
        // Removing the previous assigned style for having
        // a clean view
        importSettingsPanel.classList.remove('export');
        importSettingsPanel.classList.remove('import');
    });
  }

  //Listeners

  var addListeners = function addListeners() {
    orderCheckBox.addEventListener(
      'change', 
      // onOrderingChange.bind(this)
      function() {
        alert('NGA: Still not working :)');
      }
    );

    doneButton.addEventListener(
      'click',
      closeHandler
    );

    importContacts.addEventListener(
      'click',
      importHandler
    );

    exportContacts.addEventListener(
      'click',
      exportHandler
    );

    setICEButton.addEventListener(
      'click',
      iceHandler
    );

    // MAIN ISSUE HERE! We need to communicate with LIST
    // and show the list with EDIT mode.
    bulkDeleteButton.addEventListener(
      'click',
      deleteHandler
    );

    importSettingsHeader.addEventListener('action', importSettingsBackHandler);
  }

  //////////////////////////////////////////////////

  // Initialise the settings screen (components, listeners ...)
  var init = function initialize() {
    cacheElements();
    addListeners();
    getData();
    checkNoContacts();
    updateTimestamps();
    // To avoid any race condition we listen for online events once
    // containers have been initialized
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    // Subscribe to events related to change state in the sd card
    utils.sdcard.subscribeToChanges('check_sdcard', function(value) {
      updateStorageOptions(utils.sdcard.checkStorageCard());
    });

    window.addEventListener('timeformatchange', updateTimestamps);
    window.addEventListener('contactsimportdone', onImportDone);
  };

  // Disables/Enables an option and show the error if needed
  var updateOptionStatus =
    function updateOptionStatus(domOption, disabled, error) {
    if (domOption === null) {
      return;
    }
    var optionButton = domOption.firstElementChild;
    if (disabled) {
      optionButton.setAttribute('disabled', 'disabled');
      if (error) {
        domOption.classList.add('error');
      } else {
        domOption.classList.remove('error');
      }
    } else {
      optionButton.removeAttribute('disabled');
      domOption.classList.remove('error');
    }
  };

  // Disables/Enables the actions over the sim import functionality
  var enableSIMOptions = function enableSIMOptions(iccId, cardState) {
    var importSimOption = document.getElementById('import-sim-option-' + iccId);
    var exportSimOption = document.getElementById('export-sim-option-' + iccId);
    var disabled = (cardState !== 'ready' && cardState !== 'illegal');
    updateOptionStatus(importSimOption, disabled, true);
    updateOptionStatus(exportSimOption, disabled, true);
  };

  /**
   * Disables/Enables the actions over the sdcard import/export functionality
   * @param {Boolean} cardAvailable Whether functions should be enabled or not.
   */
  var updateStorageOptions = function updateStorageOptions(cardAvailable) {
    // Enable/Disable button and shows/hides error message
    updateOptionStatus(importSDOption, !cardAvailable, true);
    updateOptionStatus(exportSDOption, !cardAvailable, true);

    var importSDErrorL10nId = null;
    var exportSDErrorL10nId = null;

    var cardShared = utils.sdcard.status === utils.sdcard.SHARED;
    if (!cardAvailable) {
      importSDErrorL10nId = 'noMemoryCardMsg';
      exportSDErrorL10nId = 'noMemoryCardMsgExport';

      if (cardShared) {
        importSDErrorL10nId = exportSDErrorL10nId = 'memoryCardUMSEnabled';
      }
    }

    // update the message
    var importSDErrorNode = importSDOption.querySelector('p.error-message');
    if (importSDErrorL10nId) {
      importSDErrorNode.setAttribute('data-l10n-id', importSDErrorL10nId);
    } else {
      importSDErrorNode.removeAttribute('data-l10n-id');
      importSDErrorNode.textContent = '';
    }

    var exportSDErrorNode = exportSDOption.querySelector('p');
    if (exportSDErrorL10nId) {
      exportSDErrorNode.setAttribute('data-l10n-id', exportSDErrorL10nId);
    } else {
      exportSDErrorNode.removeAttribute('data-l10n-id');
      exportSDErrorNode.textContent = '';
    }

  };

  var updateOrderingUI = function updateOrderingUI() {
    var value = newOrderByLastName === null ? orderByLastName :
      newOrderByLastName;
    orderCheckBox.checked = value;
    orderCheckBox.setAttribute('aria-checked', value);
  };

  // Get the different values that we will show in the app
  var getData = function getData() {
    var config = utils.cookie.load();
    var order = config ? config.order : false;
    orderByLastName = order;
    newOrderByLastName = null;
    updateOrderingUI();
  };

  function onImportDone(evt) {
    updateTimestamps();
    checkNoContacts();
  }

  var checkOnline = function() {
    // Perform pending automatic logouts
    window.setTimeout(Settings.automaticLogout, 0);

    // Other import services settings
    updateOptionStatus(importGmailOption, !navigator.onLine, true);
    updateOptionStatus(importLiveOption, !navigator.onLine, true);
  };

  var checkNoContacts = function checkNoContacts() {
    var exportButton = exportContacts.firstElementChild;

    Settings.checkNoContacts().then(isEmpty => {
      if (isEmpty) {
        exportButton.setAttribute('disabled', 'disabled');
        bulkDeleteButton.setAttribute('disabled', 'disabled');
        setICEButton.setAttribute('disabled', 'disabled');
      } else {
        exportButton.removeAttribute('disabled');
        bulkDeleteButton.removeAttribute('disabled');
        setICEButton.removeAttribute('disabled');
      }
    }).catch(error => {
      window.console.warn(
        'Error while trying to know the contact number',
        error
      );
      // In case of error is safer to leave enabled
      exportButton.removeAttribute('disabled');
      bulkDeleteButton.removeAttribute('disabled');
    });
  };

  var updateTimestamps = function updateTimestamps() {
    // TODO Add the same functionality to 'EXPORT' methods when ready.
    var importSources =
      document.querySelectorAll('#import-options li[data-source]');
    Array.prototype.forEach.call(importSources, function(node) {
      utils.misc.getTimestamp(node.dataset.source,
                                      function(time) {
        var spanID = 'notImported';
        if (time) {
          spanID = 'imported';
          var timeElement = node.querySelector('p > time');
          timeElement.setAttribute('datetime',
                                             (new Date(time)).toLocaleString());
          timeElement.textContent = utils.time.pretty(time);
        }
        node.querySelector('p > span').setAttribute('data-l10n-id', spanID);
      });
    });
  };

  exports.SettingsUI = {
    'init': init,
    'close': close,
    'updateTimestamps': updateTimestamps,
    'showICEScreen' : showICEScreen,
    get navigation() { return navigationHandler; },
    'updateOrderingUI': updateOrderingUI
  };
})(window);