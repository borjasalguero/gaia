/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleManager = {
  paramsRetrieved: {},
  init: function fxa_module_manager_init() {
    var flow = window.location.hash.replace('#', '');
    FxaModuleUI.init(flow);
  },
  setParam: function fxa_module_manager_set_param(key, value) {
    this.paramsRetrieved[key] = value;
  },
  done: function fxa_module_manager_done() {
   // Send params to the System
   window.parent.FxUI.done(this.paramsRetrieved);
  },
  close: function fxa_module_manager_close() {
    window.parent.FxUI.error();
  }
};

Utils.once(window, 'load', FxaModuleManager.init.bind(FxaModuleManager));
