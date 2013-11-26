
FxaModuleErrors = (function() {
  'use strict';

  var _ = navigator.mozL10n.get;

  var Errors = {
    INVALID_ACCOUNTID: {
      title: _('fxa-invalid-email-address')
    },
    INVALID_PASSWORD: {
      title: _('fxa-invalid-password')
    },
    INTERNAL_ERROR_NO_CLIENT: {
      title: _('fxa-no-client')
    },
    ALREADY_SIGNED_IN_USER: {
      title: _('fxa-already-signed-in')
    },
    INTERNAL_ERROR_INVALID_USER: {
      title: _('fxa-invalid-user')
    },
    SERVER_ERROR: {
      title: _('fxa-server-error')
    },
    NO_TOKEN_SESSION: {
      title: _('fxa-no-token')
    }
  };

  return {
    responseToParams: function(response) {
      var config;

      if (response && response.error) {
        config = Errors[response.error];
      }
      else {
        console.error('invalid response sent to responseToParams');
      }

      if (!config) {
        // If there is no config, just display the response to the user
        config = {
          title: _('fxa-unknown-error'),
          message: JSON.stringify(response, null, 2)
        };
      }

      return config;
    }
  };
}());

