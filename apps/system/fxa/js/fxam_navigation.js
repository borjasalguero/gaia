'use strict';

var FxaModuleNavigation = {
  view: null,
  stepsRun: [],
  stepCount: 0,
  currentStep: null,
  maxSteps: null,
  init: function(flow) {
    // Listen on hash changes for panel changes
    var self = this;
    window.addEventListener('hashchange', function() {
      if (!location.hash)
        return;

      var panel = document.querySelector(location.hash);
      if (!panel || !panel.classList.contains('screen'))
        return;

      //TODO(Olav): Pass 'back' param from back button
      self.loadStep(panel);
    }, false);

    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = View.length;

      FxaModuleUI.setMaxSteps(View.length);
      location.hash = View.start.id;
    }.bind(this));
  },
  back: function() {
    this.stepCount--;
    var lastStep = this.stepsRun.pop();
    location.hash = lastStep.id;
  },
  loadStep: function(step, back) {
    FxaModuleUI.loadStep({
      step: step,
      count: this.stepCount,
      back: back,
      callback: function() {
        this.currentStep = step; // not dependent on the callback anymore
      }.bind(this)
    });
  },
  next: function() {
    var self = this;
    // get a reference to the module responsible for the next button ..
    // TODO(Olav): Let modules live on an object other than window?
    var currentModuleId = location.hash.substr(1);
    this.currentModule = window[this.moduleById(currentModuleId)];
    var loadNextStep = function loadNextStep(nextStep) {
      //TODO(Olav): DONE state is null ..
      if (!nextStep)
        return;
      // TODO(Olav): Move step stack to hash change ..
      self.stepCount++;
      // TODO: Use history API or move steps stack
      self.stepsRun.push(self.currentStep);
      location.hash = nextStep.id;
    };
    this.currentModule.onNext(loadNextStep);
  },
  moduleById: function(id) {
    // TODO (Olav): Make states easier to look up :)
    var moduleKey = Object.keys(FxaModuleStates).filter(function(module) {
      return FxaModuleStates[module] &&
        FxaModuleStates[module].id &&
        FxaModuleStates[module].id === id;
    }).pop();
    if (moduleKey)
      return FxaModuleStates[moduleKey].module;
  },
  done: function() {
    FxaModuleManager.done();
  }
};


