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
    if (!location.hash) {
      console.error('fxa did not specify panel');
      return;
    }
    if (location.hash.substr(1) === 'back') {
      this.backAnimation = true;
      window.history.go(-2);
      return;
    }

    var panel = document.querySelector(location.hash);
    if (!panel || !panel.classList.contains('screen')) {
      console.error('fxa navigated to unknown panel:', location.hash);
      return;
    }

    var self = this;
    this.loadStep(panel, this.backAnimation, function notifyModule() {
      var module = self.getModuleById(location.hash);
      if (module && module.refresh)
        module.refresh(FxaModuleManager.paramsRetrieved);
    });
    this.backAnimation = false;

    if (this.getProgressById(location.hash))
      FxaModuleUI.progress(this.getProgressById(location.hash));
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

  done: function() {
    FxaModuleManager.done();
  },

  _searchModuleState: function(id) {
    id = id.replace('#', '');
    return Object.keys(FxaModuleStates).map(function(key) {
      return FxaModuleStates[key];
    }).filter(function(module) {
      return module.id === id;
    }).pop();
  },

  getModuleById: function(id) {
    var moduleState = this._searchModuleState(id);

    if (moduleState && moduleState.module && window[moduleState.module])
      return window[moduleState.module];
    return false;
  },

  getProgressById: function(id) {
    var moduleState = this._searchModuleState(id);

    if (moduleState)
      return moduleState.progress;
    return false;
  }
};
