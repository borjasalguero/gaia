/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var Launcher = {
  get footer() {
    delete this.footer;
    return this.footer = document.getElementById('wrapper-footer');
  },
  get touchHandler() {
    delete this.touchHandler;
    return this.touchHandler = document.getElementById('handler');
  },
  get closeButton() {
    delete this.closeButton;
    return this.closeButton = document.getElementById('close-button');
  },
  get refreshButton() {
    delete this.refreshButton;
    return this.refreshButton = document.getElementById('reload-button');
  },
  get forwardButton() {
    delete this.forwardButton;
    return this.forwardButton = document.getElementById('forward-button');
  },
  get backButton() {
    delete this.backButton;
    return this.backButton = document.getElementById('back-button');
  },
  get wrapper() {
    delete this.wrapper;
    return this.wrapper = document.getElementById('wrapper');
  },
  get iframe() {
    delete this.iframe;
    return this.iframe = document.getElementById('wrapper').children[0];
  },
  updateNavigationBar: function l_unb(){
    this.iframe.getCanGoForward().onsuccess = (function(e) {
      if (e.target.result === true) {
        delete this.forwardButton.dataset.disabled;
      } else {
        this.forwardButton.dataset.disabled = true;
      }
    }).bind(this);
    this.iframe.getCanGoBack().onsuccess = (function(e) {
      if (e.target.result === true) {
        delete this.backButton.dataset.disabled;
      } else {
        this.backButton.dataset.disabled = true;
      }
    }).bind(this);
  },
  init: function l_init() {
    var conn = window.navigator.mozMobileConnection, url;
    if (!conn || !conn.voice.connected) {
      console.log('mozMobileConnection not available');
      // DEFAULT one
      url = 'http://www.movistar.es/';
    } else {
      var currentMCC = conn.voice.network.mcc;
      switch(currentMCC) {
        case 734:
          // MOVISTAR VENEZUELA
          url = 'https://mi.movistar.com.ve/';
          break;
        case 732:
          // MOVISTAR COLOMBIA
          url = 'http://www.m.movistar.co/Servicio_en_linea/';
          break;
        case 214:
          // MOVISTAR ESPAÑA
          url = 'http://www.movistar.es/';
          break;
        default:
          url = 'http://www.movistar.es/';
          break;
      }
    }
    // Append the iframe
    
    var iframe = document.createElement('iframe');
    iframe.setAttribute('mozbrowser', 'true');
    iframe.setAttribute('mozallowfullscreen', true);
    if (url) {
      iframe.setAttribute('src', url);
    }
    iframe.setAttribute('remote', 'true');
    this.wrapper.appendChild(iframe);

    // Adding event handlers
    var self = this;
    this.touchHandler.addEventListener('click', function() {
      self.footer.classList.remove('closed');
    });

    this.closeButton.addEventListener('click', function() {
      self.footer.classList.add('closed');
    });

    this.refreshButton.addEventListener('click', function() {
      self.iframe.reload(true);
    });

    this.backButton.addEventListener('click', function() {
      self.iframe.goBack();
      self.updateNavigationBar().bind(self);
    });

    this.forwardButton.addEventListener('click', function() {
      self.iframe.goForward();
      self.updateNavigationBar().bind(self);
    });

    this.iframe.addEventListener('mozbrowserlocationchange', function() {
      self.updateNavigationBar().bind(self);
    });
    

  }
};

window.onload = function() {
  Launcher.init();
};



