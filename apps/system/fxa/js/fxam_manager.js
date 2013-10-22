/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleManager = {
  paramsRetrieved: {},
  init: function fxamm_init() {
    var flow = window.location.hash.replace('#', '');
    FxaModuleUI.init(flow);
  },
  setParam: function fxamm_setParam(key, value) {
    this.paramsRetrieved[key] = value;
  },
  done: function fxamm_done() {
   // Send params to the System
   window.parent.FxAccountsUI.done(this.paramsRetrieved);
  },
  close: function fxamm_close(error) {
    window.parent.FxAccountsUI.error(error);
  }
};

Utils.once(window, 'load', FxaModuleManager.init.bind(FxaModuleManager));
