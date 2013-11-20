'use strict';

var FxaModuleNavigation = {
  init: function(flow) {
    // Listen on hash changes for panel changes
    window.addEventListener('hashchange', this._hashChange.bind(this), false);

    // Load view
    LazyLoader.load('view/view_' + flow + '.js', function loaded() {
      // TODO Check how to load maxSteps,
      // do we need this?
      window.location.hash = View.start.id;
    });
  },

  _hashChange: function() {
    console.log(location.hash);
    if (!location.hash)
      return;

    var panel = document.querySelector(location.hash);
    if (!panel || !panel.classList.contains('screen'))
      return;

    var self = this;
    this.loadStep(panel, this.backAnim, function notifyModule() {
      var module = self.getModuleById(location.hash);
      if (module && module.refresh)
        module.refresh(FxaModuleManager.paramsRetrieved);
    });
    this.backAnim = false;

    return false;
  },

  loadStep: function(panel, back, callback) {
    if (!panel)
      return;
    FxaModuleUI.loadScreen({
      panel: panel,
      back: back,
      callback: callback
    });
  },

  back: function() {
    FxaModuleNavigation.backAnim = true;
    window.history.back();
  },

  done: function() {
    FxaModuleManager.done();
  },

  getModuleById: function(id) {
    id = id.replace('#', '');
    var moduleState = Object.keys(FxaModuleStates).map(function(key) {
      return FxaModuleStates[key];
    }).filter(function(module) {
      return module.id === id;
    }).pop();

    if (moduleState && moduleState.module && window[moduleState.module])
      return window[moduleState.module];
    return false;
  }
};
