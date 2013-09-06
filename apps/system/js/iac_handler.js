'use strict';

var iacHandler = {
  _eventPrefix: 'iac-',
  init: function onInit() {
    var self = this;

    /*
     *  Register your connection here
     *  and remember to wrap your message in this format
     *
     *  message = {type: name, data: value};
     */
    window.navigator.mozSetMessageHandler('connection',
      function onConnected(request) {
        var port = request.port;
        port.onmessage = function onReceivedMessage(evt) {
          var message = evt.data;
          var evtName = self._eventPrefix + message.type;
          var iacEvt = document.createEvent('CustomEvent');
          iacEvt.initCustomEvent(evtName,
            /* canBubble: */ true, /* cancelable */ false, {
            data: message.data
          });

          window.dispatchEvent(iacEvt);
        };
    });
  }
};

iacHandler.init();
