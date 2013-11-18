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

    // TODO:(Olav): Add progress step
    this.loadStep(panel, this.backAnim);
    this.backAnim = false;

    return false;
  },

  loadStep: function(panel, back) {
    if (!panel)
      return;
    FxaModuleUI.loadScreen({
      panel: panel,
      back: back
    });
  },

  back: function() {
    FxaModuleNavigation.backAnim = true;
    window.history.back();
  },

  done: function() {
    FxaModuleManager.done();
  }
};
