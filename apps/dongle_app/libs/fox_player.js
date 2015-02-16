var FoxPlayer = (function(){
  var wrapper = null;
  var browser = null;
  var exitButton = null;

  function open(){
    wrapper = document.getElementById('wrapper-browser');
    wrapper.hidden = false;
    exitButton = wrapper.querySelector('#exit-button');
    exitButton.addEventListener('click', close);
    createBrowserIframe();
    show();
  }

  function show(){
    setTimeout(function(){
      wrapper.classList.remove('close');
      wrapper.mozRequestFullScreen();
    }, 100);
  }

  function close(){
    window.close();
  }

  function createBrowserIframe(){
    browser = document.createElement('iframe');
    browser.id = 'browser';
    browser.setAttribute('mozbrowser', '');
    browser.setAttribute('remote', '');
    browser.setAttribute('frameborder', 0);
    browser.setAttribute('allowfullscreen', '');
    wrapper.appendChild(browser);
  }

  function changeSrc(url){
    var video = getVideoId(url);

    if(video.is === 'youtube'){
      browser.src = 'https://www.youtube.com/embed/'+video.id+'?autoplay=1&controls=0&disablekb=1&showinfo=0';
    }
    else if(video.is === 'vimeo' ){
      browser.src = 'http://player.vimeo.com/video/'+video.id+'?autoplay=1&badge=0&byline=0&title=0';
      browser.addNextPaintListener(function(){
        setTimeout(function(){
          clickBrowser();
        }, 5000);
      })
    }
    else {
      window.open(video.url, '_blank');
    }
  }

  function getVideoId(url){
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match) {
      return { is: 'youtube', id: match[2]};
    }

    regExp = /(videos|video|channels|\.com)\/([\d]+)/;
    match = url.match(regExp);
    if (match) {
      return { is: 'vimeo', id: match[2] };
    }

    return { is: false, url: url };
  }

  function clickBrowser(){
    browser.sendMouseEvent('mousedown', 70, 50, 0, 1, 4);
    setTimeout(function(){
      browser.sendMouseEvent('mouseup', 70, 50, 0, 1, 4)
    },50);
  }

  function newUrl(url){
    open(show);
    changeSrc(url);
  }

  return {
    newUrl: newUrl,
    close: close,
    changeSrc: changeSrc
  }
})();