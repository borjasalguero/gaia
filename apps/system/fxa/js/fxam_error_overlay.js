var FxaModuleErrorOverlay = (function() {
  'use strict';

  var $ = document.querySelector.bind(document),
      DIALOG_SELECTOR = '#fxa-error-overlay',
      TITLE_SELECTOR = '#fxa-error-title',
      MESSAGE_SELECTOR = '#fxa-error-msg',
      CLOSE_BUTTON_SELECTOR = '#fxa-error-ok';


  return {
    show: function fxam_error_overlay_show(title, message) {
      var overlayEl = $(DIALOG_SELECTOR);
      var titleEl = $(TITLE_SELECTOR);
      var messageEl = $(MESSAGE_SELECTOR);

      if ( ! (overlayEl && titleEl && messageEl))
        return;

      titleEl.textContent = title;
      messageEl.textContent = message;

      overlayEl.classList.add('show');

      Utils.once(CLOSE_BUTTON_SELECTOR, 'click', this.hide);
    },

    hide: function fxam_overlay_hide() {
      var overlayEl = $(DIALOG_SELECTOR);
      if ( ! overlayEl)
        return;

      overlayEl.classList.remove('show');
    }
  };
}());


