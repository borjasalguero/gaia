(function(exports) {
  'use strict';


  /*
   * This class will be in charge of the connections with the server.
   */

  var  SERVER_URL = 'http://foxcast-dev.herokuapp.com/api/v1/';
  // var  SERVER_URL = 'http://localhost:5000/api/v1/';

  // POST http://foxcast-dev.herokuapp.com/api/v1/dongle/register
  // POST http://foxcast-dev.herokuapp.com/api/v1/:id/create
  // GET http://foxcast-dev.herokuapp.com/api/v1/:id/

  var Server = {
    request: function(target, action, requestType, data, cb) {
      // Parse data to XHR Data before sending it
      if (data) {
        var dataXHR = new FormData();
        for (var key in data) {
          dataXHR.append(key, data[key]);
        }
      }

      // Create URI. Based on the Server, we just need the target ('dongle' or dongle:id)
      // and action if required

      var uri = SERVER_URL + target;
      console.log(uri);
      if (action) {
        uri += '/' + action + '/';
      }

      var xhr = new XMLHttpRequest({mozSystem: true});

      xhr.onload = function onLoad(evt) {
        if (xhr.status === 200 || xhr.status === 0) {
          cb(null, xhr.response);
        } else {
          cb(xhr.status);
        }
      };
      xhr.open(requestType, uri, true);
      xhr.onerror = function onError(e) {
        console.error('onerror en xhr ' + xhr.status);
        cb(e);
      }
      xhr.send(dataXHR);
    }
  };


  var FoxCast = {
    register: function(endpoint, callback) {
      Server.request(
        'dongle',
        'register',
        'POST',
        {
          endpoint: endpoint
        },
        callback
      );
    },
    get: function(dongle_id, callback) {
      Server.request(
        dongle_id,
        null,
        'GET',
        null,
        callback
      );
    },
    create: function(params, callback) {
      Server.request(
        params.dongle_id,
        'create',
        'POST',
        params,
        callback
      );
    }
  };


  exports.FoxCast = FoxCast;
})(window);
