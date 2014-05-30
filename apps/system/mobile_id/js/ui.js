
/* exports UI */
/* global Controller */

(function(exports) {
  'use strict';
  var allowButton, closeButton, verificationCodeButton,
      multistateButton, panelsContainer,
      verificationCodeInput, msisdnInput,
      msisdnAutomaticOptions, typeMSISDNButton,
      selectAutomaticOptionsButton, msisdnContainer,
      countryCodesSelect, verificationPanel,
      msisdnSelectionPanel, verificationCodeTimer;

  var isVerified = false;
  var isVerifying = false;
  var isTimeoutOver = false;
  var isManualMSISDN = false;
  var buttonCurrentStatus;

  var verificationInterval, verificationIntervalSteps = 0,
      currentIntervalStep = 0;

  var countryCodes;

  function _setMultibuttonStep(stepName) {
    buttonCurrentStatus = stepName;
    var shift = 0;
    switch(stepName) {
      case 'allow':
        shift = 0;
        allowButton.className = 'msb-button-step state-allow';
        allowButton.disabled = false;
        break;
      case 'sending':
        shift = 0;
        allowButton.className = 'msb-button-step state-sending';
        allowButton.disabled = true;
        break;
      case 'verify':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verify';
        verificationCodeButton.disabled = false;
        break;
      case 'verifying':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verifying';
        verificationCodeButton.disabled = true;
        break;
      case 'verified':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-verified';
        verificationCodeButton.disabled = false;
        break;
      case 'resend':
        shift = -50;
        verificationCodeButton.className = 'msb-button-step state-resend';
        verificationCodeButton.disabled = false;
        break;
    }

    multistateButton.style.transform = 'translateX(' + shift + '%)';
  }

  function _setPanelsStep(stepName) {
    var shift = 0;
    switch(stepName) {
      case 'msisdn':
        shift = 0;
        break;
      case 'verification':
        shift = -25;
        break;
      case 'done':
        shift = -50;
        break;
    }

    panelsContainer.style.transform = 'translateX(' + shift + '%)';
  }

  function _disablePanel(stepName) {
    switch(stepName) {
      case 'msisdn':
        msisdnAutomaticOptions.classList.add('disabled');
        typeMSISDNButton.classList.add('disabled');
        selectAutomaticOptionsButton.classList.add('disabled');
        countryCodesSelect.classList.add('disabled');
        msisdnInput.disabled = true;
        break;
      case 'verification':
        verificationCodeInput.disabled = true;
        break;
    }
  }

  function _enablePanel(stepName) {
    switch(stepName) {
      case 'msisdn':
        msisdnAutomaticOptions.classList.remove('disabled');
        typeMSISDNButton.classList.remove('disabled');
        selectAutomaticOptionsButton.classList.remove('disabled');
        countryCodesSelect.classList.remove('disabled');
        msisdnInput.disabled = false;
        break;
      case 'verification':
        verificationCodeInput.disabled = false;
        break;
    }
  }

  function _msisdnContainerTranslate(step) {
    isManualMSISDN = step === 0 ? false:true;
    msisdnContainer.style.transform = 'translateX(' + -1 * 50 * step + '%)';
  }

  function _fieldErrorDance(element) {
    element.addEventListener('animationend',function danceOver() {
      verificationCodeInput.removeEventListener('animationend', danceOver);
      verificationCodeInput.classList.remove('error');
    });
    element.classList.add('error');
  }

  function _fillCountryCodesList() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function fileLoaded() {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          // Cache the CC
          countryCodes = xhr.response;
          // Clean the <select> element
          countryCodesSelect.innerHTML = '';
          // Per country, we show it CC
          var ccFragment = document.createDocumentFragment();
          Object.keys(countryCodes).forEach(function(country) {
            var option = document.createElement('option');
            option.textContent = countryCodes[country].prefix;
            option.value = country;
            ccFragment.appendChild(option);
          });

          countryCodesSelect.appendChild(ccFragment);
        } else {
          console.error('Failed to fetch file: ', xhr.statusText);
        }
      }
    };
    xhr.open('GET', ' resources/mcc.json', true);
    xhr.responseType = 'json';
    xhr.send();
  }

  function _getIdentitySelected() {
    var identity;
    if (isManualMSISDN) {
      identity =  {
        prefix: countryCodes[countryCodesSelect.value].prefix,
        mcc: countryCodesSelect.value,
        phoneNumber: msisdnInput.value
      };
    } else {
      var query = 'input[name="msisdn-option"]:checked';
      var optionChecked = document.querySelector(query);
      if (optionChecked.dataset.identificationType === 'msisdn') {
        identity =  {
          prefix: null,
          mcc: optionChecked.dataset.mcc,
          phoneNumber: optionChecked.value
        };
      } else {
        identity = {
          serviceId: optionChecked.value
        };
      }
    }
    return identity;
  }

  function _getCode() {
    return verificationCodeInput.value;
  }

  var UI = {
    init: function ui_init(params) {
      allowButton = document.getElementById('allow-button');
      closeButton = document.getElementById('close-button');
      verificationCodeButton = document.getElementById('verify-button');
      multistateButton = document.getElementById('msb');
      panelsContainer = document.getElementById('panels-container');
      verificationCodeInput = document.getElementById('verification-code');
      msisdnInput = document.getElementById('msisdn-input');
      msisdnAutomaticOptions = document.querySelector('.phone-options-list');
      typeMSISDNButton = document.getElementById('add-msisdn');
      selectAutomaticOptionsButton =
        document.getElementById('do-automatic-msisdn');
      msisdnContainer = document.querySelector('.msisdn-selection-wrapper');
      countryCodesSelect = document.getElementById('country-codes-select');
      verificationPanel = document.querySelector('.verification-panel');
      msisdnSelectionPanel = document.querySelector('.msisdn-selection-panel');
      verificationCodeTimer =
        document.getElementById('verification-code-timer');

      // Fill the country code list
      _fillCountryCodesList();

      closeButton.addEventListener(
        'click',
        function onClose() {
          Controller.postCloseAction(isVerified);
        }
      );

      typeMSISDNButton.addEventListener(
        'click',
        function onManualMSISDN(e) {
          _msisdnContainerTranslate(1);
        }
      );

      selectAutomaticOptionsButton.addEventListener(
        'click',
        function onAutomaticMSISDN(e) {
          _msisdnContainerTranslate(0);
        }
      );


      allowButton.addEventListener(
        'click',
        function onAllow(e) {
          // Disable to avoid any action while requesting the server
          _disablePanel('msisdn');
          // Update the status of the button
          _setMultibuttonStep('sending');
          // Send to controller the identity selected
          Controller.postIdentity(_getIdentitySelected());
        }
      );

      verificationCodeButton.addEventListener(
        'click',
        function onVerify(e) {
          // In the case is not verified yet
          if (!isVerified) {
            // Was the tap done in the 'resend'?
            if (verificationCodeButton.classList.contains('state-resend')) {
              verificationCodeInput.value = '';
              // Disable the panel
              _enablePanel('verification');
              // We udpate the button
              _setMultibuttonStep('verify');
              // As we are resending, we reset the conditions
              isVerifying = false;
              isTimeoutOver = false;
            } else {
              // If we are in the proccess of verifying, we need
              // first to send the code to the server
              Controller.postVerificationCode(_getCode());
              // Disable the panel
              _disablePanel('verification');
              // We udpate the button
              _setMultibuttonStep('verifying');
              // As we are verifying, we udpate the flag
              isVerifying = true;
            }
            return;
          }
          // If the identity posted to the server and/or the verification
          // code is accepted, we are ready to close the flow.
          Controller.postCloseAction(isVerified);
        }.bind(this)
      );
    },
    render: function ui_render(identifications) {
      var optionsFragment = document.createDocumentFragment();

      if (!identifications.length) {
        _msisdnContainerTranslate(1);
        selectAutomaticOptionsButton.hidden = true;
      }

      for (var i = 0, l = identifications.length; i < l; i++) {
        // identifications[i]
        var li = document.createElement('li');
        var label = document.createElement('label');
        var typeIcon = document.createElement('span');
        var radio = document.createElement('input');
        var radioMask = document.createElement('span');
        var name = document.createElement('p');


        var iconClasses = 'icon icon-simcardlock';
        if (identifications[i].primary) {
          radio.checked = 'checked';
          iconClasses+=' primary';
        } else {
          // TODO Double check para el service ID
          iconClasses+=' sim' + (+identifications[i].serviceId + 1);
        }
        typeIcon.className = iconClasses;

        name.textContent =
          identifications[i].msisdn || identifications[i].operator;
        radio.name = 'msisdn-option';
        radio.type = 'radio';

        if (identifications[i].msisdn) {
          radio.dataset.identificationType = 'msisdn';
          radio.dataset.mcc = identifications[i].mcc;
        } else {
          radio.dataset.identificationType = 'serviceid';
        }

        radio.value =
          identifications[i].msisdn || identifications[i].serviceId;
        radioMask.className = 'radio-mask';

        label.appendChild(typeIcon);
        label.appendChild(radio);
        label.appendChild(radioMask);
        label.appendChild(name);

        li.appendChild(label);

        optionsFragment.appendChild(li);

      }
      var phoneOptionsList = document.querySelector('.phone-options-list');
      phoneOptionsList.innerHTML = '';
      phoneOptionsList.appendChild(optionsFragment);
    },
    onVerifying: function ui_onverifiying() {
      // Update the button. There is no panel change
      _setMultibuttonStep('verifying');
    },
    onVerified: function ui_onverified() {
      // If our identity is registered properly, we are
      // ready to go!
      isVerifying = false;
      isVerified = true;
      clearInterval(verificationInterval);
      // Update the status of the button showing the 'success'
      _setMultibuttonStep('verified');
      // Remove the progress bar
      verificationCodeTimer.classList.remove('show');
      // Show the panel with some feedback to the user
      _setPanelsStep('done');
    },
    onVerificationCode: function ui_onVerificationCode(params) {
      // Update the status of the button
      _setMultibuttonStep('verify');
      // Show the verification code panel
      _setPanelsStep('verification');
      _enablePanel('verification');

      // Timer UI

      // Update the params we need
      isTimeoutOver = false;
      currentIntervalStep = +params.timeoutLeft;
      verificationIntervalSteps = +params.verificationTimeout;
      // Update the UI properly as starting poing
      verificationCodeTimer.max = verificationIntervalSteps;
      verificationCodeTimer.value = currentIntervalStep;
      // Add the timeout ui
      verificationCodeTimer.classList.add('show');
      // Boot the interval with the number of steps we need
      verificationInterval = setInterval(function() {
        --currentIntervalStep;
        if (currentIntervalStep < 0) {
          if (!isVerifying) {
            // Show 'resend' button
            _setMultibuttonStep('resend');
            _disablePanel('verification');
          }
          // Hide the keyboard if present
          document.activeElement.blur();
          // Set that the timeout is over
          isTimeoutOver = true;
          // Hide timer
          verificationCodeTimer.classList.remove('show');
          // Clear interval
          clearInterval(verificationInterval);
          return;
        }
        verificationCodeTimer.value = currentIntervalStep;
      }, 1000);

      // TODO Add retries when available in the server

    },
    onerror: function ui_onError(error) {
      switch (error) {
        case 'VERIFICATION_CODE_TIMEOUT':
          _disablePanel('verification');
          _setMultibuttonStep('resend');
          break;
        case 'INVALID_PHONE_NUMBER':
          _enablePanel('msisdn');
          _setMultibuttonStep('allow');
          _fieldErrorDance(msisdnInput);
          break;
        case 'INVALID_VERIFICATION_CODE':
          if (isTimeoutOver) {
            _disablePanel('verification');
            _setMultibuttonStep('resend');
            isTimeoutOver = false;
            isVerifying = false;
            return;
          }
          _enablePanel('verification');
          _setMultibuttonStep('verify');
          _fieldErrorDance(verificationCodeInput);
          break;
        default:
          if (buttonCurrentStatus === 'sending') {
            _setMultibuttonStep('allow');
          } else {
            if (isTimeoutOver) {
              _disablePanel('verification');
              _setMultibuttonStep('resend');
              isTimeoutOver = false;
              isVerifying = false;
              return;
            }
            _setMultibuttonStep('verify');
            _enablePanel('verification');
            _enablePanel('msisdn');
          }
          // TODO Add l10n to this alert
          alert('Network issue. Please try again');
          break;
      }
    },
    setScroll: function ui_setScroll() {
      // Add scroll management to show properly the input
      // when the keyboard is shown
      var bodyRect = document.body.getBoundingClientRect(),
          codeRect = verificationCodeInput.getBoundingClientRect(),
          msisdnInputRect = msisdnInput.getBoundingClientRect(),
          offsetCode   = codeRect.top - bodyRect.top,
          offsetMSISDN   = msisdnInputRect.top - bodyRect.top;

      window.addEventListener(
        'resize',
        function onResized() {
          verificationPanel.scrollTop = offsetCode;
          msisdnSelectionPanel.scrollTop = offsetMSISDN;
        }
      );
    }
  };

  exports.UI = UI;

}(this));
