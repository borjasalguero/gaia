/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var Launcher = {

  init: function l_init() {
    ['wrapper-footer', 'touch-handler', 'close-button', 'forward-button',
    'back-button', 'wrapper', 'reload-button'].forEach(function(id) {
      this[toCamelCase(id)] = document.getElementById(id);
    }, this);
    
    // Loading the configurations
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'configuration.json', true);
    xhr.responseType = 'json';
    xhr.onreadystatechange = (function() {
      if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status === 0)) {
        // We retrieve the configurations from JSON
        var params = xhr.response;
        // We get configurations & default one
        this.configurations = params.configurations;
        this.defaultConfiguration = params.default;
        // For getting the MCC/MNC we need to know params
        // of the connection
        var conn = window.navigator.mozMobileConnection, url;
        if (!conn || !conn.voice.connected) {
          console.log('mozMobileConnection not available');
          // If there is no connection available we use the default one
          url = this.defaultConfiguration.url;
        } else {
          // If a connection is available, we retrieve MCC from SIM Card
          var currentMCC = conn.voice.network.mcc;
          // We check which of the configurations is the one that we need
          for (var i = 0, l = this.configurations.length; i < l; i++) {
            if (this.configurations[i] === currentMCC) {
              url = this.configurations[i].url;
              break;
            }
          }
          // If there is no configuration for our MCC, we use the default
          if (!url) {
            url = this.defaultConfiguration.url;
          }
        }
        // Appending the iframe which load the URL
        var iframe = document.createElement('iframe');
        iframe.id = 'url-loader';
        iframe.setAttribute('mozbrowser', 'true');
        iframe.setAttribute('mozallowfullscreen', true);
        if (url) {
          iframe.setAttribute('src', url);
        }
        iframe.setAttribute('remote', 'true');
        // Appending to DOM
        this.wrapper.appendChild(iframe);
        this.iframe = iframe;

        // Adding event handlers
        var self = this;
        this.touchHandler.addEventListener('click', function() {
          self.wrapperFooter.classList.remove('closed');
        });

        this.closeButton.addEventListener('click', function() {
          self.wrapperFooter.classList.add('closed');
        });

        this.reloadButton.addEventListener('click', function() {
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

        this.iframe.addEventListener('mozbrowsererror', function(e) {
          alert('Please connect to Wifi/3G and try again.');
          window.close();
        });
      }
    }).bind(this);
    // We send the XHR request
    xhr.send();
  },
  updateNavigationBar: function l_unb() {
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
  }
};

window.addEventListener('load', function onload() {
  Launcher.init();
});

function toCamelCase(str) {
  return str.replace(/\-(.)/g, function replacer(str, p1) {
    return p1.toUpperCase();
  });
}

