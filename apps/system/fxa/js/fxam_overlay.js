/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleOverlay = {
    init: function fxam_overlay_init() {
      if (this.fxaOverlay)
        return;

      FxaModule.importElements.call(this,
        'fxa-overlay',
        'fxa-overlay-msg'
      );
    },

    show: function fxam_overlay_show(string) {
      this.init();

      if (!(this.fxaOverlay && this.fxaOverlayMsg))
        return;

      this.fxaOverlayMsg.textContent = string;
      this.fxaOverlay.classList.add('show');
    },

    hide: function fxam_overlay_hide() {
      this.init();

      if (!this.fxaOverlay)
        return;

      this.fxaOverlay.classList.remove('show');
    }
};


