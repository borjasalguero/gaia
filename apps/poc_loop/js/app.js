/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var debug = false;
var initialized = false;

window.addEventListener('localized', function localized() {
  debug && console.log('We have l10n working!');
  if (initialized) {
    return;
  }
  
  document.getElementById('launch-regular-attention').addEventListener(
    'click',
    function launchRegularAttention() {
      var host = document.location.host;
      var protocol = document.location.protocol;
      var urlBase = protocol + '//' + host + '/call.html';
      window.open(urlBase, 'call_screen', 'attention');
    }
  );

  document.getElementById('launch-telephony-attention').addEventListener(
    'click',
    function launchRegularAttention() {
      var phonenumber = document.getElementById('phone-number').value;
      navigator.mozTelephony.dial(phonenumber).then(function() {
        console.log('Realizando llamada');
      });
    }
  );

  initialized = true;
});