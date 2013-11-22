
FxaModuleStates = (function() {
  'use strict';

  // Define the states of the firefox accounts signup/signin flow.
  // The object key defines the state name, the value is the
  // URL hash of the screen to show. done is a special state that has no
  // corresponding screen.

  return {
    ENTER_EMAIL: {
      id: 'fxa-email',
      module: 'FxaModuleEnterEmail',
      progress: 33
    },
    SET_PASSWORD: {
      id: 'fxa-set-password',
      module: 'FxaModuleSetPassword'
    },
    ENTER_PASSWORD: {
      id: 'fxa-enter-password',
      module: 'FxaModuleEnterPassword',
      progress: 66
    },
    SIGNUP_SUCCESS: {
      id: 'fxa-signup-success',
      module: 'FxaModuleSignupSuccess'
    },
    SIGNIN_SUCCESS: {
      id: 'fxa-signin-success',
      module: 'FxaModuleSigninSuccess',
      progress: 100
    },
    PASSWORD_RESET_SUCCESS: {
      id: 'fxa-password-reset-success',
      module: 'FxaModulePasswordResetSuccess'
    },
    TOS: {
      id: 'fxa-tos'
    },
    PP: {
      id: 'fxa-pp'
    }
  };
}());

