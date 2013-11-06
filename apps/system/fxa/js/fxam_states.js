
FxaModuleStates = (function() {
  'use strict';

  // Define the states of the firefox accounts signup/signin flow.
  // The object key defines the state name, the value is the
  // URL hash of the screen to show. done is a special state that has no
  // corresponding screen.

  return {
    INTRO: FxaModuleIntro,
    ENTER_EMAIL: FxaModuleEnterEmail,
    SET_PASSWORD: FxaModuleSetPassword,
    ENTER_PASSWORD: FxaModuleEnterPassword,
    SIGNUP_SUCCESS: FxaModuleSignupSuccess,
    SIGNIN_SUCCESS: FxaModuleSigninSuccess,
    PASSWORD_RESET_SUCCESS: FxaModulePasswordResetSuccess,
    DONE: null
  };
}());

