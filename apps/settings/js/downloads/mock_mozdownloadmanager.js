
'use strict';

// TODO REMOVE THIS WHEN API WILL BE READY!

 var DEFAULT_PARAMS = {
    id: '0',
    totalBytes: 1800,
    currentBytes: 100,
    url: 'http://firefoxos.com/archivo.mp3',
    path: '//SDCARD/Downloads/archivo.mp3',
    state: 'downloading',
    contentType: 'audio/mpeg',
    started: new Date()
  };

function MockDownload(params) {
  console.log('PARAMAS ' + JSON.stringify(params));
  params = params || {};
  this.id = params.id || 0;
  this.totalBytes = params.totalBytes || DEFAULT_PARAMS.totalBytes;
  this.currentBytes = params.currentBytes || DEFAULT_PARAMS.currentBytes;
  this.url = params.url || DEFAULT_PARAMS.url;
  this.path = params.path || DEFAULT_PARAMS.path;
  this.state = params.state || DEFAULT_PARAMS.state;
  this.contentType = params.contentType || DEFAULT_PARAMS.contentType;
  this.started = params.started || DEFAULT_PARAMS.started;
}

MockDownload.prototype = {
  cancel: function() {},
  pause: function() {},
  resume: function() {}
};

function _getState(i) {
  if (i === 0) {
    return 'stopped';
  } else if (i === 1) {
    return 'paused';
  } else if (i === 2) {
    return 'canceled';
  } else {
    return 'downloading';
  }
}


var mockLength = 10;
navigator.mozDownloadManager = {
  getDownloads: function() {
    return {
      then: function(fulfill, reject) {
        var mockDownloads = [];
        for (var i = 0; i < mockLength; i++) {
          var download = new MockDownload({
            id: '' + i,
            url: 'http://firefoxos.com/archivo' + i + '.mp3',
            state: _getState(i)
          });
          mockDownloads.push(download);
        }
        setTimeout(function() {
          fulfill(mockDownloads);
        });
      }
    };
  },
  set ondownloadstarted(handler) {
    // Mock that a new download has been started
    setTimeout(function() {
      var newID = mockLength + 1;
      var download = new MockDownload({
        id: '' + newID,
        url: 'http://firefoxos.com/loremipsumblablablablablablablablabla.mp3',
        state: 'stopped'
      });
      handler(download);
    }, 5000);
  }
};
