/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleNavigation = {
  stepCount: 0,
  currentModule: null,
  init: function(flow) {
    // Listen on hash changes for panel changes
    window.addEventListener(
      'hashchange',
      this.hashchangeHandler.bind(this),
      false
    );

    // Load view
    LazyLoader.load('view/view_' + flow + '.js', function loaded() {
      // TODO Check how to load maxSteps,
      // do we need this?
      FxaModuleUI.setMaxSteps(View.length);
      window.location.hash = View.start.id;
    }.bind(this));
  },
  hashchangeHandler: function() {
    if (!location.hash)
        return;

    var panel = document.querySelector(location.hash);
    if (!panel || !panel.classList.contains('screen'))
      return;

    if (this.backAnim) {
      this.backAnim = false;
      this.stepCount--;
      this.loadStep(panel, true);
    } else {
      this.stepCount++;
      this.loadStep(panel);
    }
  },
  loadStep: function(panel, back) {
    if (!panel)
      return;
    var self = this;
    FxaModuleUI.loadScreen({
      panel: panel,
      count: this.stepCount,
      back: back,
      onload: function() {
        this.currentModule = window[this.moduleById(panel.id)];
        this.currentModule.init &&
          this.currentModule.init(FxaModuleManager.paramsRetrieved);
      }.bind(this),
      onanimate: function() {
        this.updatingStep = false;
      }.bind(this)
    });
  },
  back: function() {
    // Avoid multiple taps on 'back' if
    // screen transition is not over.
    if (this.updatingStep) {
      return;
    }
    this.updatingStep = true;
    // Execute module back (if is defined)
    this.currentModule.onBack && this.currentModule.onBack();
    // Go to previous step
    this.backAnim = true;

    window.history.back();


  },
  next: function() {
    // TODO Add shield against multiple taps
    var loadNextStep = function loadNextStep(nextStep) {
      if (!nextStep)
        return;
      location.hash = nextStep.id;
    };
    this.currentModule.onNext(loadNextStep.bind(this));
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
