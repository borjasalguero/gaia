/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var FxaModuleUI = {
  init: function(flow) {
    // Add listeners to the main elements
    [
      'close'
    ].forEach(function(id) {
      this[Utils.camelCase(id)] = document.getElementById('fxa-module-' + id);
    }, this);

    this.close.addEventListener('click', function() {
      FxaModuleManager.close();
    });

    FxaModuleNavigation.init(flow);
  },

  loadScreen: function(params) {
    var currentScreen = document.querySelector('.current');
    var nextScreen = params.panel;
    if (this._inTransition(currentScreen) || this._inTransition(nextScreen))
      return;

    // Lazy load current panel
    var self = this;
    this._load(nextScreen, function loaded() {
      self._animate(currentScreen, nextScreen, params.back);
      params.callback && params.callback();
    });
  },

  _load: function(screen, callback) {
    if (screen.classList.contains('loaded'))
      return callback();

    var self = this;
    LazyLoader.load(screen, function screenLoaded() {
      screen.classList.add('loaded');
      self._getScripts(screen, callback);
    });
  },

  _getScripts: function(screen, callback) {
    // The script tags inserted through lazy loading DOM elements won't
    // automatically execute, so we have to explicitly load them.
    var scripts = [].slice.call(screen.querySelectorAll('script'))
      .map(function(script) { return script.getAttribute('src'); });

    // the lazy load callback won't trigger for empty lists.
    if (scripts.length)
      LazyLoader.load(scripts, callback);
    else
      callback();
  },

  _animate: function(from, to, back, callback) {
    if (!to)
      return;

    if (!from) {
      to.classList.add('current');
      return;
    }

    from.addEventListener('animationend', function fromAnimEnd() {
      from.removeEventListener('animationend', fromAnimEnd, false);
      from.classList.remove(back ? 'currentToRight' : 'currentToLeft');
      from.classList.remove('current');
      from.classList.remove('back');
    }, false);

    to.addEventListener('animationend', function toAnimEnd() {
      to.removeEventListener('animationend', toAnimEnd, false);
      to.classList.remove(back ? 'leftToCurrent' : 'rightToCurrent');
      to.classList.add('current');
    }, false);

    from.classList.add(back ? 'currentToRight' : 'currentToLeft');
    to.classList.add(back ? 'leftToCurrent' : 'rightToCurrent');
  },

  _inTransition: function(elem) {
    return elem && (elem.classList.contains('currentToRight') ||
    elem.classList.contains('currentToLeft') ||
    elem.classList.contains('rightToCurrent') ||
    elem.classList.contains('leftToCurrent') || false);
  },

  progress: function(value) {
    document.querySelector('#fxa-progress').value = value;
  }
};
