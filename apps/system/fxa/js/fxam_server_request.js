/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

(function(exports) {

  function _setAccountDetails(response) {
    if (response && response.user.accountId) {
      FxaModuleManager.setParam('email', response.user.accountId);
      FxaModuleManager.setParam('verified', response.user.verified);
    }
  }

  function _ensureFxaClient(callback) {
    window.parent.LazyLoader.load('../js/fxa_client.js', function() {
      callback && callback();
    });
  };

  var FxModuleServerRequest = {
    checkEmail: function(email, onsuccess, onerror) {
      window.parent.LazyLoader.load('../js/fxa_client.js', function() {
        window.parent.FxAccountsClient.queryAccount(
                email,
                onsuccess,
                onerror);
      });
    },
    signIn: function(email, password, onsuccess, onerror) {

      function successHandler(response) {
        _setAccountDetails(response);
        var authenticated =
          (response && response.user && response.user.verified) || false;
        onsuccess && onsuccess({
          // use the response code as specified in
          // https://id.etherpad.mozilla.org/fxa-on-fxos-architecture
          authenticated: authenticated
        });
      }

      function errorHandler(response) {
        onerror && onerror(response);
      }

      _ensureFxaClient(function signIn() {
        window.parent.FxAccountsClient.signIn(
                email,
                password,
                successHandler,
                errorHandler);
      });

    },
    signUp: function(email, password, onsuccess, onerror) {
      function successHandler(response) {
        _setAccountDetails(response);
        onsuccess && onsuccess(response);
      }

      _ensureFxaClient(function signUp() {
         window.parent.FxAccountsClient.signUp(
                email,
                password,
                successHandler,
                onerror);
      });
    },
    requestPasswordReset: function(email, onsuccess, onerror) {
      // TODO Implement this call to the Client
      // when ready.
      onsuccess && onsuccess();
    }
  };
  exports.FxModuleServerRequest = FxModuleServerRequest;
}(this));
