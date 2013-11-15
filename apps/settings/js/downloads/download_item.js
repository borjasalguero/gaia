'use strict';

//
// Download Item helper.
// Creates and updates the dom needed to render a
// download as a list item.
// Usage:
//
// var li = DownloadItem.create(download);
//
// Once we got the reference, we can listen to click events
// or update the content if we know the download was modified:
//
// DownloadItem.update(li, download);
//
// For make it works you need to import
// "shared/locales/download.ini"

var DownloadItem = (function DownloadItem() {

  // Mapp the download status with the classes that the
  // different elements of a dom download item have.
  // This is a snapshot on how they should finish depending
  // on the state.
  var STATUS_MAPPING = {
    'downloading': {
      'asideStatus': ['hide'],
      'asideAction': ['actionCancel', 'pack-end'],
      'progress': []
    },
    // TODO : Check if it would ne needed a 'canceled' state
    'succeeded': {
      'asideStatus': ['hide'],
      'asideAction': ['hide'],
      'progress': ['hide']
    },
    'stopped': {
      'asideStatus': ['statusError'],
      'asideAction': ['actionRetry', 'pack-end'],
      'progress': ['hide']
    }
  };

  // Generates the following DOM, take into account that
  // the css needed for the classes above is in settings app:
  // downloads.css
  // @param {DomDownload} Download object to get the output from
  //
  //<li data-url="<url>" data-state="<download state>">
  //  <aside class="<statusError | >">
  //  </aside>
  //  <aside class="<actionCancel | actionRetry> pack-end"
  //      data-id="<downloadId>">
  //  </aside>
  //  <p class="fileName">Filename.doc</p>
  //  <p class="info">57% - 4.1MB of 7MB</p>
  //  <progress value="57" max="100"></progress>
  //</li>
  var create = function create(download) {
    var li = document.createElement('li');
    li.dataset.url = download.url;
    li.dataset.state = download.state;
    // TODO Use ID from API instead
    li.id = getDownloadId(download);

    var asideStatus = document.createElement('aside');

    var asideAction = document.createElement('aside');
    asideAction.classList.add('pack-end');
    asideAction.dataset.id = getDownloadId(download);

    var pFileName = document.createElement('p');
    pFileName.classList.add('fileName');
    pFileName.textContent = DownloadFormatter.getFileName(download);

    var pInfo = document.createElement('p');
    pInfo.classList.add('info');

    var progress = document.createElement('progress');
    progress.classList.add('hide');
    progress.max = 100;

    li.appendChild(asideStatus);
    li.appendChild(asideAction);
    li.appendChild(pFileName);
    li.appendChild(pInfo);
    li.appendChild(progress);

    return update(li, download);
  };

  // Given a DOM Download Item generated with the previous
  // method, update the style and the content based on the
  // given download.
  // @param {Dom Element} LI element representing the download
  // @param {DomDownload} Download object
  var update = function update(domElement, download) {
    var styles = STATUS_MAPPING[download.state];

    if (styles == null) {
      // The only possible value is for removed, we don't have UI
      // for that
      console.error('Style not found for download_item');
      return null;
    }

    var domNodes = getElements(domElement);
    applyStyles(domNodes, styles);
    updateContent(domNodes, download);

    return domElement;
  };

  // Update the content of the elements according to the download
  // status
  // @param {Object of DOM Element} Dictionary containing the DOM
  //   elements accesible by name
  // @param {DomDownload} Download object
  var updateContent = function updateContent(domNodes, download) {
    var _ = navigator.mozL10n.get;

    if (download.state === 'downloading') {

      domNodes['progress'].value =
        DownloadFormatter.getPercentage(download);

      domNodes['info'].textContent =
        _('partialResult',
          {
            partial: DownloadFormatter.getDownloadedSize(download),
            total: DownloadFormatter.getTotalSize(download)
          }
        );

    } else {
      var status = '';
      switch (download.state) {
        case 'stopped':
          status = _('stopped');
          break;
        case 'succeeded':
          status = DownloadFormatter.getTotalSize(download);
          break;
      }
      DownloadFormatter.getDate(download, function(date) {
        domNodes['info'].textContent =
          _('summary', {date: date, status: status});
      });

    }
  };

  // Given a state mapping predefined, apply it to the dom elements
  // of the download item
  // @param {Object of DOM Element} Dictionary containing the DOM
  //   elements accesible by name
  // @param {Object} Dictionary containing what are the classes that
  //   should be on the different dom elements
  var applyStyles = function applyStyles(domElements, stateMapping) {
    var elem = null;
    Object.keys(stateMapping).forEach(function onElementName(elName) {
      elem = domElements[elName];
      if (elem === null) {
        return;
      }

      var klasses = stateMapping[elName];
      if (klasses === null) {
        return;
      }

      elem.className = '';
      klasses.forEach(function(klass) {
        elem.classList.add(klass);
      });
    });
  };

  // Get's the DOM nodes for the Download Node to apply
  // the specific style
  // @param {DOM element} Given a Download LI generated with the
  //   create method, returns in an object the different components
  //   making them accessible via name
  var getElements = function getElements(domElement) {
    var domNodes = {};

    var asides = domElement.querySelectorAll('aside');
    domNodes['asideStatus'] = domElement.querySelector('aside:not(pack-end)');
    domNodes['asideAction'] = domElement.querySelector('aside.pack-end');

    domNodes['progress'] = domElement.getElementsByTagName('progress')[0];

    // Should never change with current UI specs
    domNodes['fileName'] = domElement.querySelector('p.fileName');

    domNodes['info'] = domElement.querySelector('p.info');

    return domNodes;
  };

  // TODO: Keep this function until the api returns valid dom id
  // values on the id field.
  var getDownloadId = function getDownloadId(download) {
    return download.id.replace(/[=+\\\/]/ig, '');
  };

  return {
    'create': create,
    'refresh': update,
    'getDownloadId': getDownloadId
  };

}());
