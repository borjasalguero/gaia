/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var debug = false;
var initialized = false;

var playingRingtone = false;
var playingTelephony = false;
var playingTelephony2 = false;
var playingMusic = false;
var playingNormal = false;


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
    function launchCall() {
      var phonenumber = document.getElementById('phone-number').value;
      navigator.mozTelephony.dial(phonenumber).then(function() {
        console.log('Realizando llamada');
      });
    }
  );

  var ring = new Audio();
  ring.mozAudioChannelType = 'ringer';
  ring.src = 'js/resources/movistar_ringtone.ogg';
  ring.loop = true;
  document.getElementById('play_ringer').addEventListener(
    'click',
    function playRinger() {
      if (!playingRingtone) {
        ring.play();
      } else {
        ring.pause();
      }
      playingRingtone = !playingRingtone;
    }
  );

  var telephony = new Audio();
  telephony.mozAudioChannelType = 'telephony';
  telephony.src = 'js/resources/phone1.wav';
  telephony.loop = true;
  document.getElementById('play_telephony').addEventListener(
    'click',
    function playTelephony() {
      if (!playingTelephony) {
        telephony.play();
      } else {
        telephony.pause();
      }
      playingTelephony = !playingTelephony;
    }
  );

  var telephony2 = new Audio();
  telephony2.mozAudioChannelType = 'telephony';
  telephony2.src = 'js/resources/phone2.wav';
  telephony2.loop = true;
  document.getElementById('play_telephony2').addEventListener(
    'click',
    function playTelephony() {
      if (!playingTelephony2) {
        telephony2.play();
      } else {
        telephony2.pause();
      }
      playingTelephony2 = !playingTelephony2;
    }
  );

  var music = new Audio();
  music.mozAudioChannelType = 'content';
  music.src = 'js/resources/music.ogg';
  music.loop = true;
  document.getElementById('play_music').addEventListener(
    'click',
    function playMusic() {
      if (!playingMusic) {
        music.play();
      } else {
        music.pause();
      }
      playingMusic = !playingMusic;
    }
  );

  var normal = new Audio();
  normal.mozAudioChannelType = 'normal';
  normal.src = 'js/resources/normal.ogg';
  normal.loop = true;
  document.getElementById('play_normal').addEventListener(
    'click',
    function playNormal() {
      if (!playingNormal) {
        normal.play();
      } else {
        normal.pause();
      }
      playingNormal = !playingNormal;
    }
  );

  // Activities
  document.getElementById('launch_activity').addEventListener(
    'click',
    function launch_activity() {
      var activity = new MozActivity({
        name: 'dial',
        data: {
          type: 'webtelephony/number',
          number: '612123123'
        }
      });
      activity.onsuccess = function() {
        console.log('Activity was working properly. Store in Calllog');
      };
      activity.onerror = function() {
        console.log('Error when launching an activity');
      };
    }
  );

  document.getElementById('launch_direct_activity').addEventListener(
    'click',
    function launch_direct_activity() {
      var activity = new MozActivity({
        name: 'dial',
        data: {
          type: 'webtelephony/number',
          number: '612123123',
          name: 'Loop'
        }
      });
      activity.onsuccess = function() {
        console.log('Activity was working properly. Store in Calllog');
      };
      activity.onerror = function() {
        console.log('Error when launching an activity');
      };
    }
  );

  document.getElementById('launch_loop').addEventListener(
    'click',
    function launch_activity() {
      var activity = new MozActivity({
        name: 'loop.gaiamobile.org/voice',
        data: {
          type: 'webtelephony/number',
          number: '612123123'
        }
      });
      activity.onsuccess = function() {
        console.log('Activity was working properly. Store in Calllog');
      };
      activity.onerror = function() {
        console.log('Error when launching an activity');
      };
    }
  );

  // Comms providers
  navigator.getDataStores('comms-provider')
    .then(
      function(stores) {
        if (!stores.length || stores.length !== 1) {
          console.error('Comms providers DS collision');
          return;
        }

        console.log(stores.length);
        stores[0].get(1).then(function(data) {
          for (var i = 0; i < data.providers.length; i++) {
            var p = document.createElement('p');
            p.textContent = data.providers[i].name;
            document.getElementById('comms_providers').appendChild(p);
          };
          
        
        });
      },
      function(error) {
        console.error('Error while retrieving DS ' + error.name);
      }
    );

  initialized = true;
});