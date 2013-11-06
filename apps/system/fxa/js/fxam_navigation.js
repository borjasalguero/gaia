'use strict';

var FxaModuleNavigation = {
  view: null,
  stepCount: 0,
  currentStep: null,
  maxSteps: null,
  init: function(flow) {
    // Load view
    LazyLoader._js('view/view_' + flow + '.js', function loaded() {
      this.view = View;
      this.maxSteps = View.length;
      this.currentStep = View.start;

      FxaModuleUI.setMaxSteps(View.length);
      FxaModuleUI.loadStep(this.currentStep, 0);
    }.bind(this));
  },
  back: function() {
    this.stepCount--;
    FxaModuleUI.loadStep(this.lastStep, this.stepCount);
  },
  next: function() {
    /*
    var futureIndex = this.stepCount + 1;
    var futureStep = this.view[futureIndex];
    */
    // this.currentStep = this.view[++this.stepCount];
    function loadNextStep(futureStep) {
      FxaModuleNavigation.lastStep = FxaModuleNavigation.currentStep;
      FxaModuleNavigation.currentStep = futureStep;
      FxaModuleNavigation.stepCount++;
      function callback() {
        /*
        FxaModuleNavigation.currentStep.init &&
        FxaModuleNavigation.currentStep.init(
          FxaModuleManager.paramsRetrieved
        );
        */
      };

      FxaModuleUI.loadStep(FxaModuleNavigation.currentStep,
        FxaModuleNavigation.stepCount,
        callback);
    };


    /*
    if (!this.currentStep.handler.onNext) {
      loadNextStep();
    } else {
      */
      this.currentStep.onNext(loadNextStep);
    /*}*/
  },
  done: function() {
    FxaModuleManager.done();
  }
};


