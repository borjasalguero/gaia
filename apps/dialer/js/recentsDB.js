'use strict';

var RecentsDBManager = {
  _dbName: 'dialerRecents',
  _dbStore: 'dialerRecents',
  _dbVersion: 1,
  _init: function rdbm_init(callback) {
    try {
      var indexedDB = window.indexedDB || window.webkitIndexedDB ||
                        window.mozIndexedDB || window.msIndexedDB;
      if (!indexedDB) {
        console.log('Indexed DB is not available!!!');
        return;
      }
      var self = this;
      // Open DB
      this.request = indexedDB.open(this._dbName, this._dbVersion);
      //Once DB is opened
      this.request.onsuccess = function(event) {
        //Store DB object in RecentsDBManager
        self.db = event.target.result;
        // If we are in browser we are going to prepopulate for testing
        if (!navigator.mozSms) {
          // We mockup the App for Dev-Team
          self._prepopulateDB.call(self);
        }else {
          //Callback if needed
          if (callback) {
            callback.call(self);
          }
        }
      };
      this.request.onerror = function(event) {
        // TODO Do we have to implement any custom error handler?
        console.log('Database error: ' + event.target.errorCode);
      };

      this.request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objStore = db.createObjectStore('dialerRecents',
          { keyPath: 'date' });
        objStore.createIndex('number', 'number');
      };
    }catch (ex) {
      // TODO Do we have to implement any custom error handler?
      console.log(ex.message);
    }
  },
  // Method which check if DB is ready
  _checkDB: function rdbm_checkDB(callback) {
    var self = this;
    if (!this.db) {
      this.request.addEventListener('success', function rdbm_DBReady() {
        self.request.removeEventListener('success', rdbm_DBReady);
        self._checkDB.call(self, callback);
      });
      return;
    }
    if (callback && callback instanceof Function) {
      callback.call(this);
    }
  },
  // Metod for adding an item to recents of DB
  _add: function rdbm_add(recentCall) {
    this._checkDB.call(this, function() {
      var txn = this.db.transaction('dialerRecents', 'readwrite');
      var store = txn.objectStore('dialerRecents');
      var self = this;
      var request = store.put(recentCall);
      request.onsuccess = function sr_onsuccess() {
        self._get.call(self);
      };
      request.onerror = function(e) {
        console.log('dialerRecents add failure: ',
          e.message, request.errorCode);
      };
   });
  },
  // Method for prepopulating the recents DB for Dev-team
  _prepopulateDB: function rdbm_prepopulateDB() {
    var recentsEntry = {
      date: Date.now(),
      type: 'incoming-connected',
      number: '123123123'
    };
    this._add.call(this, recentsEntry);
  },
  // Method for deleting an item from DB
  _delete: function rdbm_delete() {
    //TODO Implement
  },
  // Method for retrieving all recents from DB
  _get: function rdbm_get(callback) {
    var objectStore = this.db.transaction('dialerRecents').
      objectStore('dialerRecents');
    var recents = [];
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        recents.push(cursor.value);
        cursor.continue();
      }
      else {
        alert(recents.length);
        if (callback instanceof Function) {
          callback(recents);
        }
      }
    };


  }
};
