/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* exported AudioChannelCompetition */

/* globals AudioContext */

(function(exports) {
  'use strict';


  var debug = true;

  /** App name competing for the telephony audio channel. */
  var _appName = null;

  /** AudioContext object reference. */
  var _ac = null;

  /** Buffer source we use for competing for the telephony audio channel. */
  var _silenceBufferSource = null;

  /** Object with all handlers to AudioChannels events */
  var _listeners = {};

  function _executeListener(event) {
    var handler = _listeners[event.type];
    handler && handler();
  }

  /**
   * The AudioCompetingHelper singleton object helps the callscreen to compete
   * for the telephony audio channel. After bug 1016277 apps use the telephony
   * audio channel on a LIFO basis which means apps might be muted by other
   * apps trying to use the telephony audio channel.
   */
  var AudioChannelCompetition = {

    on: function(events) {
      debug && console.log('AudioChannelCompetition.on');
      console.log('******** ' + Object.getOwnPropertyNames(events));

      Object.getOwnPropertyNames(events).forEach(function(val) {
        console.log(val);
        console.log(events[val]);
        _listeners[val] = events[val];
      })
    },

    start: function(channel) {
      debug && console.log('AudioChannelCompetition.start ' + _listeners['mozinterruptbegin']);
      if (_ac) {
        return;
      }

      if (!channel ||
          typeof channel !== 'string' ||
          channel.length === 0) {
        channel = 'normal';
      }

      // Let's create the AudioContext using the channel defined as a param.
      // By default we will use the low priority one, in this case 'normal'
      // For more info check [1]
      //
      // [1] https://developer.mozilla.org/en-US/docs/Web/API/AudioChannels_API/
      // Using_the_AudioChannels_API
      _ac = new AudioContext(channel);

      _ac.addEventListener('mozinterruptbegin', _executeListener);
      _ac.addEventListener('mozinterruptend', _executeListener);

      // After landing bug [2] AudioContext is going to be started automatically
      // However, we will keep a buffer in order to stop & resume when requested
      // without creating a new AudioContext
      //
      // [2] https://bugzilla.mozilla.org/show_bug.cgi?id=1041594
      _silenceBufferSource = _ac.createBufferSource();
      _silenceBufferSource.buffer = _ac.createBuffer(1, 2048, _ac.sampleRate);
      _silenceBufferSource.connect(_ac.destination);
      _silenceBufferSource.loop = true;
      _silenceBufferSource.start(0);

    },

    stop: function(events) {
      debug && console.log('AudioChannelCompetition.stop');
      if (!_silenceBufferSource) {
        return;
      }
      _silenceBufferSource.stop(0);
    },

    resume: function(events) {
      debug && console.log('AudioChannelCompetition.resume');
      if (!_silenceBufferSource) {
        return;
      }
      _silenceBufferSource.stop(0);
      _silenceBufferSource.start(0);
    },

    leave: function(events) {
      debug && console.log('AudioChannelCompetition.leave');
      // Stop competing
      _silenceBufferSource.stop(0);
      // Remove listeners
      _ac.removeEventListener('mozinterruptbegin', _executeListener);
      _ac.removeEventListener('mozinterruptend', _executeListener);
      // Clean all vars
      _ac = null;
      _silenceBufferSource = null;
      _listeners = {};
    }
  };

  exports.AudioChannelCompetition = AudioChannelCompetition;
})(this);
