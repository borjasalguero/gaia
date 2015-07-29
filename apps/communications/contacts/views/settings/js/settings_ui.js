(function(exports) {
  'use strict';

  var orderItem,
      importContacts,
      exportContacts,
      doneButton,
      setICEButton,
      bulkDeleteButton;
    // navigationHandler,
    // importSettingsHeader,
    // orderCheckBox,
    // orderItem,
    // orderByLastName,
    // importSettingsPanel,
    // importSettingsTitle,
    // importOptions,
    // exportOptions,
    // importLiveOption,
    // importGmailOption,
    // importSDOption,
    // exportSDOption,
    // newOrderByLastName = null,
    // PENDING_LOGOUT_KEY = 'pendingLogout',
    // bulkDeleteButton;

  function closeHandler() {
    window.dispatchEvent(new Event('close-ui'));
  }

  function cacheElements() {
    orderItem = document.getElementById('settingsOrder');
    doneButton = document.getElementById('settings-close');
    importContacts = document.getElementById('importContacts');
    exportContacts = document.getElementById('exportContacts');
    setICEButton = document.getElementById('set-ice');
    bulkDeleteButton = document.getElementById('bulkDelete');
  }

  function addListeners() {
    orderItem.addEventListener(
      'click',
      function() {
        alert('order!');
      }
    );

    doneButton.addEventListener(
      'click',
      closeHandler
    );

    importContacts.addEventListener(
      'click',
      function() {
        alert('Import!');
      }
    );

    exportContacts.addEventListener(
      'click',
      function() {
        alert('Export!');
      }
    );

    setICEButton.addEventListener(
      'click',
      function() {
        alert('Set ICE!');
      }
    );

    // MAIN ISSUE HERE! We need to communicate with LIST
    // and show the list with EDIT mode.
    bulkDeleteButton.addEventListener(
      'click',
      function() {
        alert('Delete!');
      }
    );
  }

  window.SettingsUI = {
    init: function() {
      cacheElements();
      addListeners();
    }
  };
}(window));