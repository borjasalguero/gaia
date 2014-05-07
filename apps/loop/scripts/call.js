window.onload = function() {
  var STATUS_BAR_HEIGHT = 40;
  var currentStream = null;
  // Handle status bar
  window.addEventListener('resize', function() {
    if (document.body.clientHeight <= STATUS_BAR_HEIGHT) {
      document.body.classList.add('status');
    } else {
      document.body.classList.remove('status');
    }
  });
  

  // Get params from the call
  var id = null;
  var rawParams = window.location.search.slice(1);
  var params = rawParams.split('&');
  for (var i = 0; i < params.length; i++) {
    if (params[i].indexOf('id=') !== -1) {
      id = params[i].replace('id=', '');
    }
  }

  // Video mockup
  var fullscreenVideo = document.getElementById('fullscreen-video');
  fullscreenVideo.mozAudioChannelType = 'telephony';
  navigator.mozGetUserMedia(
    {
      audio: true
    },
    function(stream) {
      console.log('Audio & Video retrieved!');
      currentStream = stream;
      if (navigator.mozGetUserMedia) {
        fullscreenVideo.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        fullscreenVideo.src = vendorURL.createObjectURL(stream);
      }
      // fullscreenVideo.src = 'scripts/resources/big-buck-bunny_trailer.webm';
      // fullscreenVideo.loop = true;
      // fullscreenVideo.autoplay = true;
      fullscreenVideo.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );
  
  var speakerEnabled = true;
  var videoEnabled = true;
  document.getElementById('contact-phone-details').textContent = 'Loop user: ' + id;
  document.getElementById('actions-panel').addEventListener(
    'click',
    function(event) {
      event.target.classList.toggle('active');
      switch(event.target.dataset.action) {
        case 'mute':
          fullscreenVideo.muted = !fullscreenVideo.muted;
          break;
        case 'speaker':
          if (speakerEnabled) {
            console.log('Vamos a usar el earphone');
            fullscreenVideo.pause();
            fullscreenVideo.mozSrcObject = null;
            speakerEnabled = false;
            fullscreenVideo.mozAudioChannelType = 'telephony';
            fullscreenVideo.mozSrcObject = currentStream;
            // fullscreenVideo.src = 'scripts/resources/big-buck-bunny_trailer.webm';
            // fullscreenVideo.autoplay = true;
            fullscreenVideo.play();
          } else {
            console.log('Vamos a usar el SPEAKER');
            fullscreenVideo.pause();
            fullscreenVideo.mozSrcObject = null;
            speakerEnabled = true;
            fullscreenVideo.mozAudioChannelType = 'content';
            fullscreenVideo.mozSrcObject = currentStream;
            // fullscreenVideo.src = 'scripts/resources/big-buck-bunny_trailer.webm';
            fullscreenVideo.play();
          }
          
          break;
        case 'video':
          if (videoEnabled) {
            fullscreenVideo.hidden = true;
            videoEnabled = false;
          } else {
            fullscreenVideo.hidden = false;
            videoEnabled = true;
          }
          break;
        case 'add-contact':
          console.log('addcontact');
          break;
      }
    }
  );

  document.getElementById('hang-out').addEventListener(
    'click',
    function hangOutClick() {
      fullscreenVideo.pause();
      window.close();
    }
  );
}