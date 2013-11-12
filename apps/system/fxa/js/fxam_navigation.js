'use strict';

var FxaModuleNavigation = {
  view: null,
  stepsRun: [],
  stepCount: 0,
  currentStep: null,
  maxSteps: null,
  init: function(flow) {
    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = View.length;

      FxaModuleUI.setMaxSteps(View.length);
      this.loadStep(View.start);
    }.bind(this));
  },
  back: function() {
    this.stepCount--;
    var lastStep = this.stepsRun.pop();
    this.loadStep(lastStep, true);
  },
  loadStep: function(step, back) {
    FxaModuleUI.loadStep({
      step: step,
      count: this.stepCount,
      back: back,
      callback: function(module) {
        this.currentModule = module;
        this.currentStep = step;
      }.bind(this)
    });
  },
  next: function() {
    var self = this;
    var loadNextStep = function loadNextStep(nextStep) {
      self.stepCount++;
      self.stepsRun.push(self.currentStep);
      self.loadStep(nextStep);
    };
    this.currentModule.onNext(loadNextStep);
  },
  done: function() {
    FxaModuleManager.done();
  }
};


