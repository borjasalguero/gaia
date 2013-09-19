'use strict';

var WallpaperCustomizer = {
  init: function wc_init() {
    var self = this;
    window.addEventListener('customization', function updateWallpaper(event) {
      if (event.detail.setting === 'wallpaper') {
        window.removeEventListener('customization', updateWallpaper);
        self.setWallpaper(event.detail.value);
      }
    });
  },

  retrieveWallpaper: function wc_retrieveWallpaper(url, onsuccess, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      if (xhr.status === 200) {
        onsuccess && onsuccess(this.response);
      } else {
        onerror && onerror();
      }
    };

    try {
      xhr.send();
    } catch (e) {
      onerror && onerror();
    }
  },

  setWallpaperSetting: function wc_setWallpaperSetting(blob) {
    var request = navigator.mozSettings.createLock().set({
      'wallpaper.image': blob
    });
  },

  setWallpaper: function wc_setWallpaper(url) {
    this.retrieveWallpaper(url, this.setWallpaperSetting,
      function onerrorRetrieving() {
      console.error('Error retrieving the file ' + url);
    });
  }
};
WallpaperCustomizer.init();
