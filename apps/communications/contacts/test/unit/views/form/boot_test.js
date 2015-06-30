/* global LazyLoader, Form, FormUI */

'use strict';

require('/shared/test/unit/load_body_html_helper.js');
require('/shared/js/lazy_loader.js');
requireApp('communications/contacts/views/form/js/boot.js');


suite('Boot', function() {

  setup(function() {
    loadBodyHTML('/contacts/views/form/form.html');
  });

  teardown(function() {
    document.body.innerHTML = '';
  });

  suite('DOMContentLoaded', function() {
    var stub;
    setup(function() {
      stub = this.sinon.stub(LazyLoader, 'load', function(files, callback) {
        callback();
      });
      window.dispatchEvent(new CustomEvent('DOMContentLoaded'));
    });

    teardown(function() {
      LazyLoader.load.restore();
    });

    test(' > LazyLoader must be called 2 times', function() {
      // We must have 2 calls to LazyLoader
      assert.isTrue(stub.calledTwice);
    });

    test(' > First call must ensure localization', function() {
      // First of all we need to bring l10n library for localization
      var firstCall = stub.getCall(0);
      assert.isTrue(Array.isArray(firstCall.args[0]));
      assert.equal(firstCall.args[0][0], '/shared/js/l10n.js');
    });

    test(' > Second call must load the template', function() {
      // Secondly we lazy load the panel, so the param must be the element
      // of the DOM to fill with the template
      var secondCall = stub.getCall(1);
      assert.equal(secondCall.args[0][0].id, 'view-contact-form');
    });
  });

  suite('Loaded', function() {
    var realFormController, realFormUI, realMozSetMessage;
    suiteSetup(function() {
      realFormController = window.Form;
      realFormUI = window.FormUI;

      window.Form = {
        init: function foo() {}
      };

      window.FormUI = {
        init: function foo() {}
      };

      realMozSetMessage = navigator.mozSetMessageHandler;
      navigator.mozSetMessageHandler = function foo() {};
    });

    suiteTeardown(function() {
      window.Form = realFormController;
      window.FormUI = realFormUI;
      navigator.mozSetMessageHandler = realMozSetMessage;

      realFormController = null;
      realFormUI = null;
      realMozSetMessage = null;
    });

    setup(function() {
      this.sinon.stub(LazyLoader, 'load', function(files, callback) {
        callback();
      });
    });

    test(' > Controller is initialized', function() {
      var formSpy = this.sinon.spy(Form, 'init');
      window.dispatchEvent(new CustomEvent('load'));
      assert.isTrue(formSpy.calledOnce);
    });

    test(' > UI is initialized', function() {
      var formUISpy = this.sinon.spy(FormUI, 'init');
      window.dispatchEvent(new CustomEvent('load'));
      assert.isTrue(formUISpy.calledOnce);
    });
  });

  suite('Activity', function() {
    var realFormController, realFormUI, realMozSetMessage;
    var fakeActivity = {
      source: {
        data: {
          params: ['test']
        }
      }
    };

    suiteSetup(function() {
      realFormController = window.Form;
      realFormUI = window.FormUI;

      window.Form = {
        init: function init() {},
        setActivity: function setActivity() {}
      };

      window.FormUI = {
        init: function init() {},
        render: function render() {}
      };
    });

    suiteTeardown(function() {
      window.Form = realFormController;
      window.FormUI = realFormUI;

      realFormController = null;
      realFormUI = null;
      realMozSetMessage = null;
    });

    setup(function() {
      this.sinon.stub(LazyLoader, 'load', function(files, callback) {
        callback();
      });
    });

    test(' > Listener to activity is set properly', function(done) {
      this.sinon.stub(navigator, 'mozSetMessageHandler', function() {
        done();
      });
      window.dispatchEvent(new CustomEvent('load'));
    });

    test(' > UI is updated properly with activity params', function(done) {
      var formUIRenderSpy = this.sinon.spy(FormUI, 'render');
      this.sinon.stub(navigator, 'mozSetMessageHandler',
        function(name, callback) {
          callback(fakeActivity);
          assert.isTrue(formUIRenderSpy.called);
          assert.equal(
            formUIRenderSpy.getCall(0).args[0],
            fakeActivity.source.data.params
          );
          done();
        }
      );
      window.dispatchEvent(new CustomEvent('load'));
    });

    test(' > Activity is cached in Controller', function(done) {
      var formActivitySpy = this.sinon.spy(Form, 'setActivity');
      this.sinon.stub(navigator, 'mozSetMessageHandler',
        function(name, callback) {
          callback(fakeActivity);
          assert.isTrue(formActivitySpy.called);
          done();
        }
      );
      window.dispatchEvent(new CustomEvent('load'));
    });
  });
});
