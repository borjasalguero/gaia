/*
 * Once critical path is loaded, we will listen events dispatched
 * from the UI. This events will come with the info needed in order
 * to execute actions related with the UI (close, save, update...).
 *
 * Controller will *not* contain any code related with the DOM/UI,
 * and will rely on the info provided by the event.
 */

(function(exports) {
  'use strict';

  function close() {
    window.history.back();
  }

  exports.SettingsController = {
    init: function() {
      window.addEventListener('close-ui', function() {
        close();
      });
    }
  };
}(window));
