/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/*
 * This function is in charge of rendering & update the list of downloads.
 */


(function(exports) {
  'use strict';

  var downloadsContainer = null;

  function _render(downloads, oncomplete) {
    if (!downloadsContainer) {
      return;
    }

    if (!downloads || downloads.length == 0) {
      // TODO Implement screen of 'no-downloads yet'
      // https://bugzilla.mozilla.org/show_bug.cgi?id=940886
      console.log('No downloads available message');
      return;
    }
    // Clean before rendering
    downloadsContainer.innerHTML = '';
    // Render
    downloads.forEach(function(download) {
      _append(download);
    });

    oncomplete && oncomplete();
  }

  function _onerror() {
    // TODO Implement screen or error message
    console.error('Error while retrieving');
  }

  function _create(download) {
    var li = DownloadItem.create(download);
    if (download.state === 'downloading') {
      download.onstatechange = _onDownloadStateChange;
    }
    li.addEventListener('click', _onDownloadAction);
    return li;
  }

  function _prepend(download) {
    downloadsContainer.insertBefore(
      _create(download),
      downloadsContainer.firstChild
    );
  }

  function _append(download) {
    downloadsContainer.appendChild(_create(download));
  }

  function _update(download) {
    var id = DownloadItem.getDownloadId(download);
    var elementToUpdate = downloadsContainer.querySelector('#' + id);
    if (!elementToUpdate) {
      console.error('Item to update not found');
      return;
    }
    DownloadItem.refresh(elementToUpdate, download);
    DownloadApiManager.updateDownload(download);
  }

  function _delete(id) {
    var elementToDelete = downloadsContainer.querySelector('#' + id);
    if (!elementToDelete) {
      console.error('Item to delete not found');
      return;
    }
    downloadsContainer.removeChild(elementToDelete);
  }

  function _onDownloadAction(event) {
    var downloadID = event.target.id || event.target.dataset.id;
    var download = DownloadApiManager.getDownload(
      downloadID,
      _actionHandler
    );
  }

  function _onDownloadStateChange(event) {
    var download = event.download;
    _update(download);
  }

  function _actionHandler(download) {
    if (!download) {
      console.error('Download not retrieved properly');
      return;
    }

    switch (download.state) {
      case 'downloading':
        // downloading -> paused
        _pauseDownload(download);
        break;
      case 'stopped':
        // paused -> downloading
        _restartDownload(download);
        break;
      case 'succeeded':
        // launch an app to view the download
        _launchDownload(download);
        break;
    }

  }

  function _pauseDownload(download) {
    var request = DownloadUI.show(DownloadUI.TYPE.STOP, download);

    request.onconfirm = function() {
      // TODO Check this with the API
      if (download.pause) {
        download.pause().then(function() {
          // Remove listener
          download.onstatechange = null;
          _update(download);
        }, function() {
          console.error('Could not pause the download');
        });
      }
    };

  }

  function _restartDownload(download) {
    var request = DownloadUI.show(DownloadUI.TYPE.STOPPED, download);

    function checkDownload() {
      download.onstatechange = _onDownloadStateChange;
      _update(download);
    }

    request.onconfirm = function() {
      if (download.resume) {
        download.resume().then(function() {
          checkDownload();
        }, function onError() {
          // If we try to do a resume and it fails means
          // it's not supported on the server, do a
          // full restart of the download
          download.restart().then(function() {
            checkDownload();
          });
        });
      }
    };
  };

  function _launchDownload(download) {
    DownloadLauncher.launch(download);
  }



  var DownloadsList = {
    init: function(oncomplete) {
      var scripts = [
        'js/downloads/download_api_manager.js',
        'shared/js/download/download_store.js',
        'shared/js/download/download_ui.js',
        'shared/js/mime_mapper.js',
        'shared/js/download/download_launcher.js',
        'shared/js/download/download_formatter.js',
        'js/downloads/download_item.js'
      ];
      if (!navigator.mozDownloadManager) {
        // Add the mock if the download api is not present
        scripts.push('js/downloads/mock_mozdownloadmanager.js');
      }
      LazyLoader.load(scripts, function onload() {
        // Init the container
        downloadsContainer = document.querySelector('#downloadList ul');
        // Render the entire list
        DownloadApiManager.getDownloads(
          _render.bind(this),
          _onerror.bind(this),
          oncomplete
        );
        // Update if needed
        DownloadApiManager.setOnDownloadHandler(_prepend);
      });
    }
  };

  exports.DownloadsList = DownloadsList;

}(this));


// startup
navigator.mozL10n.ready(DownloadsList.init.bind(DownloadsList));

