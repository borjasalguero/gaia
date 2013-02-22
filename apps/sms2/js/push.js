/**
 * This library implements the navigator.mozPush & navigator.push libraries
 * on a non natively supported browsers.
 * This can be used as a secure fallback since the native version is used if it
 * exists
 * 
 * Author: Fernando Rodríguez Sela, 2013
 * All rights reserverd. January 2013
 * 
 * License: GNU Affero V3 (see LICENSE file)
 */


'use strict';

/**
 * Implementation of navigator.push
 * W3C spec: http://www.w3.org/TR/push-api/
 */

function _Push() {
}
_Push.prototype = {
  // Default parameters
  DEBUG: true,    // Enable/Disable DEBUG traces
  server: {
    host: 'ks364682.kimsufi.com:8080',
    ssl: false
  },
  wakeup: {
    ip: 'http://ks364682.kimsufi.com',
    port: '8080',
    protocol: 'tcp',
    mcc: '214',
    mnc: ''//'07', // Commented to avoid UDP wakeup on desktop !
  },

  /////////////////////////////////////////////////////////////////////////
  // Push methods
  /////////////////////////////////////////////////////////////////////////

  requestURL: function(watoken, pbk) {
    var cb = {};

    if(!watoken || !pbk) {
      this.debug('[requestURL] Error, no WAToken nor PBK provided');
      setTimeout(function() {
        if(cb.onerror) cb.onerror('Error, no WAToken nor PBK provided');
      });
      return cb;
    }

    this.registerUA(function () {
      this.registerWA(watoken, pbk, function(URL) {
        this.debug('[registerWA Callback] URL: ',URL);
        if(cb.onsuccess) {
          cb.onsuccess(URL);
        }
      }.bind(this));
    }.bind(this));

    window.addEventListener('pushmessage', function(event) {
      this.debug('[pushmessage Callback] Message: ',event.detail.message);
      if(cb.onmessage) {
        cb.onmessage(event.detail.message);
      }
    }.bind(this));

    return cb;
  },

  /////////////////////////////////////////////////////////////////////////
  // Auxiliar methods (out of the standard, only used on this fallback)
  /////////////////////////////////////////////////////////////////////////

  /**
   * Initialize
   */
  init: function() {
    if(this.initialized) {
      return;
    }

    this.debug('Initializing');

    this.server.ad_ws = 'ws'+(this.server.ssl ? 's' : '')+'://';
    this.server.ad_ws += this.server.host;
    this.server.ad_http = 'http'+(this.server.ssl ? 's' : '')+'://';
    this.server.ad_http += this.server.host;

    this.server.ws = {
      connection: null,
      ready: false
    };

    this.server.registeredUA = false;

    this.token = null;
    this.publicURLs = [];

    this.initialized = true;
  },

  /**
   * Recover UAToken
   */

  getToken: function(cb) {
    if(this.token) {
      this.debug('[getToken] Returning cached UAToken: ' + this.token);
      if(cb) cb(this.token);
      return;
    }

    var xmlhttp = new XMLHttpRequest({ mozSystem: true });
    xmlhttp.onreadystatechange = (function() {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          this.token = xmlhttp.responseText;
          this.debug('[getToken] New UAToken recovered: ' + this.token);
          if(cb) cb(this.token);
        } else {
          this.debug('[getToken] The notification server is not working');
        }
      }
    }.bind(this));
    xmlhttp.open('GET', this.server.ad_http + '/token', true);
    xmlhttp.send(null);
  },

  /**
   * Register UA
   */
  registerUA: function(cb) {
    if(this.server.registeredUA) {
      if(cb) cb();
      return;
    }

    this.onRegisterUAMessage = function(msg) {
      this.debug('[onRegisterUAMessage] TODO: Manage WATokens re-registration',
        msg.WATokens)
      /*
      for(var i in msg.WATokens) {
        // TODO - Manage re-registrations
      }
      */
      if(cb) cb();
    }.bind(this);

    // We cann't continue without UAToken
    this.getToken(function(uatoken) {
      this.openWebsocket();
    }.bind(this));
  },

  /**
   * Register WA
   */
  registerWA: function(token, pbk, cb) {
    this.onRegisterWAMessage = function(msg) {
      this.debug('[onRegisterWAMessage] ', msg);

      this.publicUrl = msg.url;
      this.publicURLs.push(this.publicUrl);

      if(cb) cb(this.publicUrl);
    }.bind(this);

    this.debug('[registerWA] Going to register WA');
    this.sendWS({
      data: {
        watoken: token,
        pbkbase64: pbk                                                                              //utf8_to_b64(this.pbk)
      },
      messageType: 'registerWA'
    });
  },

  /**
   * Open Websocket connection
   */
  openWebsocket: function() {
    this.debug('[openWebsocket] Openning websocket to: ' + this.server.ad_ws);
    this.server.ws.connection =
      new WebSocket(this.server.ad_ws, 'push-notification');

    this.server.ws.connection.onopen = this.onOpenWebsocket.bind(this);
    this.server.ws.connection.onclose = this.onCloseWebsocket.bind(this);
    this.server.ws.connection.onerror = this.onErrorWebsocket.bind(this);
    this.server.ws.connection.onmessage = this.onMessageWebsocket.bind(this);
  },

  /**
   * Send a Websocket message (object)
   */
  sendWS: function(json) {
    var msg = JSON.stringify(json);
    this.debug('[sendWS] Preparing to send: ' + msg);
    this.server.ws.connection.send(msg);
  },

  /**
   * Websocket callbacks
   */
  onOpenWebsocket: function() {
    this.debug('[onOpenWebsocket] Opened connection to ' + this.server.host);
    this.server.ws.ready = true;

    // We shall registerUA each new connection
    this.debug('[onOpenWebsocket] Started registration to the notification server');
    this.sendWS({
      data: {
        uatoken: this.token,
        'interface': {
          ip: this.wakeup.ip,
          port: this.wakeup.port
        },
        mobilenetwork: {
          mcc: this.wakeup.mcc,
          mnc: this.wakeup.mnc
        },
        protocol: this.wakeup.protocol
      },
      messageType: 'registerUA'
    });
  },

  onCloseWebsocket: function(e) {
    this.debug('[onCloseWebsocket] Closed connection to ' + this.server.ad +
      ' with code ' + e.code + ' and reason ' + e.reason);
    this.server.ws.ready = false;
  },

  onErrorWebsocket: function(e) {
    this.debug('[onErrorWebsocket] Error in websocket in ' + this.server.ad +
      ' with error ' + e.error);
    this.server.ws.ready = false;
  },

  onMessageWebsocket: function(e) {
    this.debug('[onMessageWebsocket] Message received --- ' + e.data);
    var msg = JSON.parse(e.data);
    if(msg[0]) {
      for(var m in msg) {
        this.manageWebSocketResponse(msg[m]);
      }
    } else {
      this.manageWebSocketResponse(msg);
    }
  },

  manageWebSocketResponse: function(msg) {
    switch(msg.messageType) {
      case 'registerUA':
        this.server.registeredUA = true;
        this.onRegisterUAMessage(msg);
        break;

      case 'registerWA':
        this.debug('[manageWebSocketResponse registerWA] Registered WA');
        this.onRegisterWAMessage(msg);
        break;

      case 'notification':
        this.debug('[manageWebSocketResponse notification] Going to ack the message ' + msg.messageId);
        var event = new CustomEvent('pushmessage', {
          detail: { 'message': msg.message }
        });
        window.dispatchEvent(event);

        this.sendWS({
          messageType: 'ack',
          messageId: msg.messageId
        });
        break;
    }
  },

  /**
   * Debug logger method
   */
  debug: function(msg, obj) {
    if(this.DEBUG) {
      var message = msg;
      if(obj) {
        message += ': ' + JSON.stringify(obj);
      }
      console.log('[PUSH (LIBRARY) LIBRARY DEBUG] ' + message);
    }
  }
};

/**
 * Autoinitialization and redefinition of navigator.push if needed
 */

(function() {
  // Enable/Disable DEBUG traces
  var DEBUG = true;

  /**
   * Debug logger method
   */
  function debug(msg, obj) {
    if(DEBUG) {
      var message = msg;
      if(obj) {
        message += ': ' + JSON.stringify(obj);
      }
      console.log('[PUSH (INIT) LIBRARY DEBUG] ' + message)
    }
  }

  /**
   * Check navigator.[mozPush|push] support and fallback if not supported
   */
  function init() {
    debug('Checking navigator.push existance');
    if(navigator.push) {
      debug('navigator.push supported by your browser');
      return;
    }
    if(navigator.mozPush) {
      debug('navigator.mozPush supported by your browser');
      navigator.push = navigator.mozPush;
      debug('navigator.push = navigator.mozPush');
      return;
    }
    debug('No push supported by your browser. Falling back');
    navigator.push = new _Push();
    navigator.mozPush = navigator.push;
    navigator.push.init();
  }

  init();
})();
