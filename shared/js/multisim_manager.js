/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* globals LazyLoader, SettingsListener, SimPicker, MultiSimManager */
/* exported MultiSimManager */


(function (exports) {
  'use strict';

  var _selectedSim;
  var _isMultiSim;
  // Keep this in sync with SimSettingsHelper.
  const ALWAYS_ASK_OPTION_VALUE = '-1';
  const SETTINGS_KEY = 'ril.telephony.defaultServiceId';


  var MultiSimManager = {
    init: function() {
      LazyLoader.load(['/shared/js/settings_listener.js'], function() {
        SettingsListener.observe(
          SETTINGS_KEY,
          0, // Default value
          function(simIndex) {
            _selectedSim = simIndex;
          });
      });

      _isMultiSim = navigator.mozIccManager &&
                    navigator.mozIccManager.iccIds.length > 1;
    },
    get isMultiSIM() {
      return _isMultiSim;
    },
    get selectedSim() {
      if (window.TelephonyHelper) {
        var inUseSim = window.TelephonyHelper.getInUseSim();
        if (inUseSim !== null) {
          _selectedSim = inUseSim;
        }
      }

      return _selectedSim;
    },
    selectSIM: function(number, callback) {
      LazyLoader.load(['/shared/js/sim_picker.js'], function() {
        SimPicker.getOrPick(
          _selectedSim,
          number,
          callback
        );
      });
    },
    executeActionBySIM: function(number, action) {
      if (typeof action !== 'function') {
        return;
      }
      console.log('Vamos al lio con _selectedSim ' + _selectedSim);
      console.log('Vamos al lio con ALWAYS_ASK_OPTION_VALUE ' +
        ALWAYS_ASK_OPTION_VALUE);
      if (_selectedSim == ALWAYS_ASK_OPTION_VALUE) {
        console.log('Vamonos con el picker!');
        MultiSimManager.selectSIM(
          number,
          function onSimSelected(simIndex) {
            action(number, simIndex);
          }
        );
      } else {
        console.log('NO ME HACE FALTA el picker!');
        action(number, this.selectedSim);
      }
    }
  };

  exports.MultiSimManager = MultiSimManager;

}(this));

MultiSimManager.init();
