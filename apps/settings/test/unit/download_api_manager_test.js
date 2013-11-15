
'use strict';

require('/shared/test/unit/mocks/mock_download.js');
require('/shared/test/unit/mocks/mock_navigator_moz_downloads.js');

require('/shared/test/unit/mocks/mock_navigator_datastore.js');
require('/shared/js/download/download_store.js');
requireApp('settings/test/unit/mock_download_store.js');


requireApp('settings/js/downloads/download_api_manager.js');

suite('DownloadApiManager', function() {
  var mocksHelperForDownloadApi = new MocksHelper([
    'DownloadStore'
  ]);
  var realMozDownloads, realDatastore;
  suiteSetup(function() {
    realMozDownloads = navigator.mozDownloadManager;
    navigator.mozDownloadManager = MockMozDownloads;

    mocksHelperForDownloadApi.suiteSetup();
  });

  suiteTeardown(function() {
   navigator.mozDownloadManager = realMozDownloads;

   mocksHelperForDownloadApi.suiteTeardown();
  });

  suite(' > methods', function() {
    var downloadsMock;
    setup(function(done) {
      DownloadApiManager.getDownloads(function(downloads) {
        downloadsMock = downloads;
        done();
      });
    });

    teardown(function() {
      downloadsMock = null;
      MockDownloadStore.downloads = [];
    });

    test(' > getDownloads with empty datastore', function() {
      // We have *one* item finalized (check the Mock), so it's not
      // considered as partof the list (we just ignore it because
      // it's supossed to be part of the datastore).
      // So we one less element than the mockLength
      assert.equal(downloadsMock.length, MockMozDownloads.mockLength - 1);
    });

    test(' > getDownloads with one item completed in datastore',
      function(done) {
      // In this case the item 'finalized' is stored in our datastore
      // so we merge both lists!
      MockDownloadStore.downloads = [new MockDownload({
        state: 'succeeded'
      })];
      DownloadApiManager.getDownloads(function(downloads) {
        assert.equal(downloads.length, MockMozDownloads.mockLength);
        done();
      });
    });

    test(' > getDownloads sorted properly', function(done) {
      // In this case the item 'finalized' is stored in our datastore
      // so we merge both lists!
      MockDownloadStore.downloads = [new MockDownload({
        state: 'succeeded'
      })];
      DownloadApiManager.getDownloads(function(downloads) {
        var timeIndex;
        for (var i = 0; i < downloads.length; i++) {
          if (!timeIndex) {
            timeIndex = downloads[i].startTime.getTime();
          } else {
            assert.ok(timeIndex >= downloads[i].startTime.getTime());
            timeIndex = downloads[i].startTime.getTime();
          }
        }
        done();
      });
    });

    test(' > getDownload given an ID', function(done) {
      DownloadApiManager.getDownload(0, function(download) {
        assert.equal(download.id, 0);
        done();
      });
    });

    test(' > updateDownload', function(done) {
      DownloadApiManager.getDownload(0, function(download) {
        // This one comes from datastore, so state is succeed.
        var previousState = download.state;
        download.state = 'downloading';
        DownloadApiManager.updateDownload(download);
        assert.isFalse(previousState === download.state);
        done();
      });
    });

    test(' > deleteDownload given an ID', function(done) {
      DownloadApiManager.deleteDownload(0, function() {
        // Once deleted, we try to get the same object
        DownloadApiManager.getDownload(0, function(download) {
          // Now the object does not exist
          assert.ok(!download);
          done();
        });
      });
    });
  });
});


