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
    this.loadStep(lastStep);
  },
  loadStep: function(step) {
    FxaModuleUI.loadStep(step, this.stepCount, function(module) {
      this.currentModule = module;
      this.currentStep = step;
    }.bind(this));
  },
  next: function() {
    var loadNextStep = function loadNextStep(nextStep) {
      this.stepCount++;
      this.stepsRun.push(this.currentStep);
      this.loadStep(nextStep);
    }.bind(this);


    this.currentModule.onNext(loadNextStep);
  },
  done: function() {
    FxaModuleManager.done();
  }
};


