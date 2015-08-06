'use strict';
/* global _ */
/* global ConfirmDialog */
/* global Contacts */
/* global ContactsBTExport */
/* global ContactsExporter */
/* global ContactsSDExport */
/* global ContactsSIMExport */
/* global fb */
/* global IccHandler */
/* global LazyLoader */
/* global Rest */
/* global SimContactsImporter */
/* global SimDomGenerator */
/* global utils */
/* global VCFReader */
/* global ContactsService */
/* global ExtServices */
/* global SettingsUI */
/* global contacts */
/* global Controller */

(function(exports) {
  var PENDING_LOGOUT_KEY = 'pendingLogout';

    var EXPORT_TRANSITION_LEVEL = 2, DELETE_TRANSITION_LEVEL = 1;

  // Initialise the settings screen (components, listeners ...)
  var init = function initialize() {
    // Create the DOM for our SIM cards and listen to any changes
    IccHandler.init(new SimDomGenerator(), SettingsUI.cardStateChanged);

    fbLoader.load();

    ////////

    window.addEventListener('close-ui', function() {
      window.history.back();
    });

    window.addEventListener('delete-ui', function() {
        window.location.href = '/contacts/views/list/list.html?action=delete';
    });

    document.getElementById('import-options').addEventListener(
      'click',
      doImportHandler
    );

    function doImportHandler(e){
      /* jshint validthis:true */

      var source = getSource(e);
      switch (source) {
        case 'sim':
          var iccId = e.target.parentNode.dataset.iccid;
          window.setTimeout(requireSimImport.bind(this,
            onSimImport.bind(this, iccId)), 0);
          break;
        case 'sd':
          window.setTimeout(requireOverlay.bind(this, onSdImport), 0);
          break;
        case 'gmail':
          ExtServices.importGmail();
          break;
        case 'live':
          ExtServices.importLive();
          break;
      }
    };

    document.getElementById('export-options').addEventListener(
      'click',
      doExportHandler
    );

    function doExportHandler(e){
      var source = getSource(e);
      var location = '/contacts/views/list/list.html?action=export&destination=' + source
      if (source === 'sim') {
        var iccId = e.target.parentNode.dataset.iccid;
        location += '&' + iccId;
      }
      window.location.href = location;
    }
    ////////
  };

  //////////////////

  // Given an event, select wich should be the targeted
  // import/export source
  var getSource = function(e) {
    var source = e.target.parentNode.dataset.source;
    // Check special cases
    if (source && source.indexOf('-') != -1) {
      source = source.substr(0, source.indexOf('-'));
    }
    return source;
  };

  //////////////////

  var checkNoContacts = function() {
    return new Promise((resolve, reject) => {
      ContactsService.isEmpty(function(error, isEmpty) {
        if (error) {
          reject(error);
        } else {
          resolve(isEmpty);
        }
      });
    });
  };

  /**
   * Loads the overlay class before showing
   */
  var requireOverlay = function(callback) {
    callback();
    // Loader.utility('Overlay', callback);
  };

  function saveStatus(data) {
    window.asyncStorage.setItem(PENDING_LOGOUT_KEY, data);
  }

  var automaticLogout = function() {
    if (navigator.offLine === true) {
      return;
    }

    LazyLoader.load(['/shared/js/contacts/utilities/http_rest.js'],
    function() {
      window.asyncStorage.getItem(PENDING_LOGOUT_KEY, function(data) {
        if (!data) {
          return;
        }
        var services = Object.keys(data);
        var numResponses = 0;

        services.forEach(function(service) {
          var url = data[service];

          var callbacks = {
            success: function logout_success() {
              numResponses++;
              window.console.log('Successfully logged out: ', service);
              delete data[service];
              if (numResponses === services.length) {
                saveStatus(data);
              }
            },
            error: function logout_error() {
              numResponses++;
              if (numResponses === services.length) {
                saveStatus(data);
              }
            },
            timeout: function logout_timeout() {
              numResponses++;
              if (numResponses === services.length) {
                saveStatus(data);
              }
            }
          };
          Rest.get(url, callbacks);
        });
      });
    });
  };

  function Settings() {
    Controller.call(this);
  }

////////// IMPORT ////////////////

  /**
   * Loads required libraries for sim import
   */
  var requireSimImport = function(callback) {
    var libraries = ['Import_sim_contacts'];
    var pending = libraries.length;

    libraries.forEach(function onPending(library) {
      Loader.utility(library, next);
    });

    function next() {
      if (!(--pending)) {
        callback();
      }
    }
  };

  // Import contacts from SIM card and updates ui
  var onSimImport = function(iccId, done) {
    var icc = IccHandler.getIccById(iccId);
    if (icc === null) {
      return;
    }
    var progress = utils.overlay.show('simContacts-reading',
      'activityBar', null, true);

    var wakeLock = navigator.requestWakeLock('cpu');

    var cancelled = false, contactsRead = false;
    var importer = new SimContactsImporter(icc);
    utils.overlay.oncancel = function oncancel() {
      cancelled = true;
      importer.finish();
      if (contactsRead) {
        // A message about canceling will be displayed while the current chunk
        // is being cooked
        progress.setClass('activityBar');
        utils.overlay.hideMenu();
        progress.setHeaderMsg('messageCanceling');
      } else {
        importer.onfinish(); // Early return while reading contacts
      }
    };
    var totalContactsToImport;
    var importedContacts = 0;
    // Delay for showing feedback to the user after importing
    var DELAY_FEEDBACK = 200;

    importer.onread = function import_read(n) {
      contactsRead = true;
      totalContactsToImport = n;
      if (totalContactsToImport > 0) {
        progress.setClass('progressBar');
        progress.setHeaderMsg('simContacts-importing');
        progress.setTotal(totalContactsToImport);
      }
    };

    importer.onfinish = function import_finish(numDupsMerged) {
      window.setTimeout(function onfinish_import() {
        resetWait(wakeLock);
        if (importedContacts > 0) {
          var source = 'sim-' + iccId;
          utils.misc.setTimestamp(source, function() {
            // Once the timestamp is saved, update the list
            window.dispatchEvent(new CustomEvent('contactsimportdone'));
          });
        }
        if (!cancelled) {
          utils.status.show({
            id: 'simContacts-imported3',
            args: {
              n: importedContacts
            }
          },
          !numDupsMerged ? null : {
            id: 'contactsMerged',
            args: {
              numDups: numDupsMerged
            }
          });
        }

        typeof done === 'function' && done();

      }, DELAY_FEEDBACK);

      importer.onfinish = null;
    };

    importer.onimported = function imported_contact() {
      importedContacts++;
      if (!cancelled) {
        progress.update();
      }
    };

    importer.onerror = function import_error() {
      var cancel = {
        title: 'cancel',
        callback: function() {
          ConfirmDialog.hide();
        }
      };
      var retry = {
        title: 'retry',
        isRecommend: true,
        callback: function() {
          ConfirmDialog.hide();
          // And now the action is reproduced one more time
          window.setTimeout(requireSimImport.bind(this,
            onSimImport.bind(this, iccId)), 0);
        }
      };
      ConfirmDialog.show(null, 'simContacts-error', cancel, retry);
      resetWait(wakeLock);
    };

    importer.start();
  };

  var onSdImport = function(cb) {
    var cancelled = false;
    var importer = null;
    var progress = utils.overlay.show('memoryCardContacts-reading',
      'activityBar', null, true);
    utils.overlay.oncancel = function() {
      cancelled = true;
      importer ? importer.finish() : utils.overlay.hide();
    };
    var wakeLock = navigator.requestWakeLock('cpu');

    var importedContacts = 0;
    // Delay for showing feedback to the user after importing
    var DELAY_FEEDBACK = 200;

    utils.sdcard.retrieveFiles([
      'text/vcard',
      'text/x-vcard',
      'text/directory;profile=vCard',
      'text/directory'
    ], ['vcf', 'vcard'], function(err, fileArray) {
      if (err) {
        return import_error(err, cb);
      }

      if (cancelled) {
        return;
      }

      if (fileArray.length) {
        utils.sdcard.getTextFromFiles(fileArray, '', onFiles);
      } else {
        import_error('No contacts were found.', cb);
      }
    });

    function onFiles(err, text) {
      if (err) {
        return import_error(err, cb);
      }

      if (cancelled) {
        return;
      }

      importer = new VCFReader(text);
      if (!text || !importer) {
        return import_error('No contacts were found.', cb);
      }

      importer.onread = import_read;
      importer.onimported = imported_contact;
      importer.onerror = import_error;

      importer.process(function import_finish(total, numDupsMerged) {
        window.setTimeout(function onfinish_import() {
          utils.misc.setTimestamp('sd', function() {
            // Once the timestamp is saved, update the list
            window.dispatchEvent(new CustomEvent('contactsimportdone'));
            resetWait(wakeLock);

            if (!cancelled) {
              var msg1 = {
                id: 'memoryCardContacts-imported3',
                args: {
                  n: importedContacts
                }
              };
              var msg2 = !numDupsMerged ? null : {
                id: 'contactsMerged',
                args: {
                  numDups: numDupsMerged
                }
              };

              utils.status.show(msg1, msg2);

              if (typeof cb === 'function') {
                cb();
              }
            }
          });
        }, DELAY_FEEDBACK);
      });
    }

    function import_read(n) {
      progress.setClass('progressBar');
      progress.setHeaderMsg('memoryCardContacts-importing');
      progress.setTotal(n);
    }

    function imported_contact() {
      importedContacts++;
      progress.update();
    }

    function import_error(e, cb) {
      var cancel = {
        title: 'cancel',
        callback: function() {
          ConfirmDialog.hide();
        }
      };

      var retry = {
        title: 'retry',
        isRecommend: true,
        callback: function() {
          ConfirmDialog.hide();
          // And now the action is reproduced one more time
          window.setTimeout(requireOverlay.bind(this, onSdImport), 0);
        }
      };
      ConfirmDialog.show(null, 'memoryCardContacts-error', cancel,
        retry);
      resetWait(wakeLock);
      if (typeof cb === 'function') {
        cb();
      }
    }
  };

  function resetWait(wakeLock) {
    utils.overlay.hide();
    if (wakeLock) {
      wakeLock.unlock();
    }
  }

////////// IMPORT ////////////////

  Settings.prototype = {
    'init': init,
    'checkNoContacts': checkNoContacts,
    'automaticLogout': automaticLogout
  };

  exports.Settings = new Settings();

})(window);