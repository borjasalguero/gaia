'use strict';

function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}

var WebJabber = {
  pushURL: '',
  jid: '',
  server: 'http://91.121.210.81:8082/',
  _sendXMLHttpRequest: function(url, callback, errorHandler) {
    var request = new XMLHttpRequest({ mozSystem: true });
    request.open('GET', url, true);
    request.onreadystatechange = (function (oEvent) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          if (callback) {
            console.log('*********************************');
            console.log(request.responseText);
            console.log('*********************************');
            var json = JSON.parse(request.responseText);
            callback(request.status, json);
          }
        } else {
          console.log('HTTP Request Error');
          if (errorHandler) {
            errorHandler(request.status, request.responseText);
          }
        }
      }
    }).bind(this);
    request.send(null);
  },
  init: function(pushurl) {
    console.log('Establishing the URL');
    WebJabber.pushurl = pushurl;
  },
  connect: function(email, pwd, callback, errorHandler) {
    console.log('Connecting....');
    var url = this.server + "connect?jid=" + email + "&pwd=" + pwd + "&push=" + this.pushurl;
    var self = this;
    console.log('URL '+url);
    var callback2 = function(status, response) {
      // TODO Review if there is an error
      if (status === 200 && response.status === 'OK') {
        console.log('New jif is '+email);
        self.jid = email;
      }
      callback(status, response);
    };
    this._sendXMLHttpRequest(url, callback2, errorHandler);
  },

  getContacts: function(callback, errorHandler) {
    var url = this.server + "receivestatus?jid=" + this.jid;
    this._sendXMLHttpRequest(url, function(status, json){
      // TODO review status
      if(callback){
        callback(json);
      }
    });
  },

  getMessages: function(callback, errorHandler) {
    var url = this.server + "receive?jid=" + this.jid;
    this._sendXMLHttpRequest(url, function(status, json){
      if(callback){
        callback(json);
      }
    });
  },

  send: function(to, msg, callback, errorHandler) {
    var url = this.server + "send?jid=" + this.jid + "&from=" + this.jid + "&to=" + to + "&msg=" + msg;
    this._sendXMLHttpRequest(url, callback);
  }
};