'use strict';

mocha.globals(['dispatchEvent']);

requireApp('system/js/iac_handler.js');

var MockMozSetMessageHandler_listeners = {};
function MockMozSetMessageHandler(event, listener) {
  MockMozSetMessageHandler_listeners[event] = listener;
}

suite('iac handler > ', function() {

  var realMozSetMessageHandler;
  var spyDispatchEvent;
  var fakePort = {
    postMessage: function(e) {
      this.onmessage.call(this, e);
    }
  };

  setup(function() {
    realMozSetMessageHandler = navigator.mozSetMessageHandler;
    navigator.mozSetMessageHandler = MockMozSetMessageHandler;

    spyDispatchEvent = this.sinon.spy(window, 'dispatchEvent');

    iacHandler.init();
  });

  teardown(function() {
    navigator.mozSetMessageHandler = realMozSetMessageHandler;
    spyDispatchEvent.restore();
  });

  test('iacHandler can send to right consumer', function() {

    // pretend Gecko call this event somewhere
    MockMozSetMessageHandler_listeners['connection']({
      port: fakePort
    });

    fakePort.postMessage({
      data: {
        type: 'ftudone',
        data: true
      }
    });

    assert.ok(spyDispatchEvent.args[0][0].detail.data);
  });
});
