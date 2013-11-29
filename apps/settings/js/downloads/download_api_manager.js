
(function(exports) {
  'use strict';

  var downloadsCache = {};

  var COMPLETE_STATE = 'finalized';

  function _appendDownloadsToCache(downloads) {
    for (var i = 0; i < downloads.length; i++) {
      _appendToDownloadsCache(downloads[i]);
    }
  }

  function _appendToDownloadsCache(download) {
    downloadsCache[getDownloadId(download)] = download;
  }


  function _updateDownloadInCache(download) {
    downloadsCache[download.id] = download;
  }

  function _deleteFromDownloadsCache(id) {
    delete downloadsCache[id];
  }

  function _resetDownloadsCache() {
    downloadsCache = {};
  }

  // TODO: remove this once the api returns valid
  // ids suitable for being used as dom id.
  function getDownloadId(download) {
    return download.id.replace(/[=+\\\/]/ig, '');
  };

  var DownloadApiManager = {
    getDownloads: function(onsuccess, onerror, oncomplete) {
      var promise = navigator.mozDownloadManager.getDownloads();
      promise.then(
        function(apiDownloads) {

          // Retrieve complete downloads from Datastore
          var request = DownloadStore.getAll();
          request.onsuccess = function(event) {
            function isDownloaded(download) {
              return (download.state !== COMPLETE_STATE);
            }
            // Not completed from the API
            var notCompletedDownloads = apiDownloads.filter(isDownloaded);
            // Completed from API
            var completedDownloads = event.target.result;
            // Merge both
            var downloads = notCompletedDownloads.concat(completedDownloads);
            // Sort by timestamp
            downloads.sort(function(a, b) {
              return b.startTime.getTime() - a.startTime.getTime();
            });
            // Append to the Dictionary
            _appendDownloadsToCache(downloads);
            onsuccess(downloads, oncomplete);
          };
          request.onerror = function(e) {
            // Append to the Dictionary
            _appendDownloadsToCache(apiDownloads);
            onsuccess(apiDownloads, oncomplete);
            // onerror && onerror();
          };
        }.bind(this),
        onerror
      );
    },
    setOnDownloadHandler: function(callback) {
      function handler(evt) {
        var download = evt.download;
        _appendToDownloadsCache(download);
        if (typeof callback === 'function') {
          callback(download);
        }
      }
      navigator.mozDownloadManager.ondownloadstart = handler;
    },

    deleteDownload: function(id, callback) {
      _deleteFromDownloadsCache(id);
      // TODO Add API Call
      if (typeof callback === 'function') {
        callback();
      }
    },

    getDownload: function(id, callback) {
      if (typeof callback === 'function') {
        callback(downloadsCache[id]);
      }
    },

    updateDownload: function(download) {
      _updateDownloadInCache(download);
    }
  };

  exports.DownloadApiManager = DownloadApiManager;

}(this));


