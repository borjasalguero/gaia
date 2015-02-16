'use strict';

/*
 * This app is needed in order to pair our dongle and the 'sender' device.
 * Once the app is opened/installed, we will register ourselves in the server
 * and we will offer a QR Code with the UUID of the dongle registered.
 */

window.onload = function() {
  var debug = false;
  // Cache the dongle_id when ready
  var dongle_id = null;

  /* JUST FOR DEBUGGING! This will be used in Addon */
  var createButton = document.getElementById('create');
  createButton.addEventListener(
    'click',
    function() {
      //'https://www.youtube.com/watch?v=UMJpK8cBjkQ'
      //'http://vimeo.com/62092214'
      //'http://www.marca.com'
      FoxCast.create(
        {
          url: 'http://vimeo.com/62092214',
          dongle_id: dongle_id,
          action:  'open' // Could be 'open' or 'watch'
        }, function(e, result) {
          if (e) {
            console.log('ERROR WHILE CREATING MEDIA ' + e);
            return;
          }
          console.log('MEDIA CREATED ' + result);
        }
      )
    }
  );

  /*
   * Method for rendering the dongle info in QR format
   */
  function showQR(dongle) {
    console.log(dongle._id);
    doqr(dongle._id);

    dongle_id = dongle._id;
    createButton.disabled = false; // TODO Remove.This will be
                                   // implemented in the ADDON
  }

  /*
   * Method for registering the push endpoint in the server
   */
  function registerDongle(endpoint) {
    debug && console.log('registerDongle ' + endpoint);

    FoxCast.register(
      endpoint,
      function onRegistered(e, result) {
        if (e) {
          console.log('ERROR when registering endpoing ' + e);
          return;
        }
        var dongle = JSON.parse(result);
        // Cache info for future requests
        asyncStorage.setItem(
          'dongle',
          dongle
        );
        // Show the info when registered
        showQR(dongle);
      }
    );
  }

  /*
   * Start listening push events
   */
  var isNotificationHandled = false;
  function registerPush(callback) {
    debug && console.log('registerPush');

    if (!navigator.push) {
      alert('You are not in Firefox OS or you dont have the right permission.');
      return;
    }
    // Create a channel in order to get the push notifications
    // TODO Show a button in order to reset all this info.
    SimplePush.createChannel(
      'foxcast-notifications',
      function onNotification(version) {
        console.log('isNotificationHandled ' + isNotificationHandled);
        // If a notification arrives, we need to check all media
        // content to show based on dongle_id
        FoxCast.get(
          dongle_id,
          function(e, result) {
            if (e) {
              console.log('ERROR WHILE REQUESTING ' + JSON.stringify(e));
              return;
            }

            // Retrieve URL
            var urlObjects = JSON.parse(result);
            if (!urlObjects || urlObjects.length === 0) {
              return;
            }
            var url = urlObjects[urlObjects.length - 1].url

            if (isNotificationHandled) {
              FoxPlayer.changeSrc(url);
              return;
            }

            isNotificationHandled = true;

            if(!document.hidden) {
              FoxPlayer.newUrl(url);
            } else {
              var request = window.navigator.mozApps.getSelf();
              request.onsuccess = function() {
                if (request.result) {
                  request.result.launch();
                  setTimeout(function() {
                    FoxPlayer.newUrl(url);
                  });
                }
              };
            }

          }
        );
      },
      function onRegistered(error, endpoint) {
        if (error || !endpoint) {
          alert('Some error happened when registering.');
          return;
        }

        if (typeof callback === 'function') {
          callback(endpoint);
        }

        SimplePush.start();
      }
    );
  }

  //Start the QR and register it (if doesn'r exist)
  function boot(){
    asyncStorage.getItem(
      'dongle',
      function onRetrieved(dongle) {
        console.log('asyncStorage GET ' + dongle);
        if (!dongle) {
          registerPush(registerDongle);
          return;
        }
        registerPush();
        showQR(dongle);
      }
    );
    window.removeEventListener('online',  boot);
  }

  if(navigator.onLine){
    boot();
  }else{
    updateOnlineStatus();
    window.addEventListener('online',  boot);
  }

  //For blocking or unblocking the app if the user doesn't have connection
  function updateOnlineStatus() {
    if(navigator.onLine){
      document.body.classList.remove('no-connection');
    }else{
      document.body.classList.add('no-connection');
      var userResponse = window.confirm('You don\'t have internet connection. Do you want turn it on now?');
      if(userResponse) {
        var activity = new window.MozActivity({
        name: 'configure',
          data: {
            target: 'device',
            section: 'root',
            filterBy: 'connectivity'
          }
        });
        activity.onerror = function() {
          console.warn('Configure activity error:', activity.error.name);
        };
      }
    }
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  //For stopping the video if the app lose the focus
  document.addEventListener('mozvisibilitychange', function() {
    if(document.hidden){
      FoxPlayer.close();
    }
  });

  //regenerate the QR
  var regenerateButton = document.getElementById('regenerate');
  regenerateButton.addEventListener('click', function(){
    asyncStorage.removeItem('dongle', function(){
      SimplePush.reset();
      boot();
    });
  })

};
