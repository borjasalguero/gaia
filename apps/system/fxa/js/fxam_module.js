FxaModule = (function() {
  'use strict';

  // A super simple pub/sub for params shared between modules.
  var state = {}, subscribers = {};

  var Module = {
    init: function() {},

    initNav: function() {
      var currentPanel = document.querySelector(location.hash);
      if (!currentPanel)
        return;

      var nextButton = currentPanel.querySelector('.right');
      var backButton = currentPanel.querySelector('.left');

      nextButton && nextButton
        .addEventListener('click', this.onNext.bind(this, function(state) {
          //TODO(Olav): No more states, callbacks or gotos!
          // Instead, manipulate the location.hash directly.
          location.hash = state.id;
        }), false);
      backButton && backButton
        .addEventListener('click', FxaModuleNavigation.back, false);
    },

    onNext: function() {
      // override this to take care of when the user clicks on the "next"
      // button. Validate any inputs, talk with the backend, do processing.
      // When complete, change url hash to an id from fxam_states.js
    },

    onChange: function(key, func) {
      // subscribe to the key by calling func each time some modules changes key
      if (typeof(key) !== 'string' || typeof(func) !== 'function')
        return;
      subscribers[key] = subscribers[key] || {};
      var module = this;
      subscribers[key][module] = func;
      // Also call it when initializing
      func(state[key]);
    },

    set: function(key, value) {
      // setting a key will trigger the onChange function of all subscribers.
      state[key] = value;
      if (!key in subscribers)
        return;

      for (var module in subscribers[key])
        subscribers[key][module](value);
    },

    importElements: function() {
      var ids = [].slice.call(arguments, 0);
      ids.forEach(function(id) {
        this[Utils.camelCase(id)] = document.getElementById(id);
      }, this);
    }
  };

  return Module;

}());
