/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var debug = false;
var initialized = false;

var playingRingtone = false;
var playingTelephony = false;
var playingTelephony2 = false;
var playingMusic = false;


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
  music.mozAudioChannelType = 'normal';
  music.src = 'js/resources/music.ogg';
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

  

  initialized = true;
});