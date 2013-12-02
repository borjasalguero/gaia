/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';


var FxaModule = (function() {

  var Module = {
    initialized: false,
    init: function init() {
      // override this to do initialization
    },

    onNext: function onNext(gotoNextStepCallback) {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, call gotoNextStepCallback with the next state from
      // fxam_states.js
    },

    onBack: function onBack() {
      // handle "back" button presses.
    },

    importElements: function importElements() {
      var ids = [].slice.call(arguments, 0);
      ids.forEach(function(id) {
        this[Utils.camelCase(id)] = document.getElementById(id);
      }, this);
    },

    showErrorResponse: function showErrorResponse(response) {
      FxaModuleOverlay.hide();
      LazyLoader.load('js/fxam_errors.js', function() {
        var config = FxaModuleErrors.responseToParams(response);
        FxaModuleErrorOverlay.show(config.title, config.message);
      });
    }
  };

  return Module;

}());

