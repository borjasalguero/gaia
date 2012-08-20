alert("RecentsDBManager loaded");

var RecentsDBManager = {
  _dbName: 'dialerRecents',
  _dbStore: 'dialerRecents',
  _dbVersion: 1,
  _init: function rdbm_init(callback) {
    alert("Init start");
    try {
    	// Retrieve indexedDB Object if is available
      var indexedDB = window.indexedDB || window.webkitIndexedDB ||
                      window.mozIndexedDB || window.msIndexedDB;
    	if (!indexedDB) {
    		// TODO Do we have to implement any custom error handler?
      	console.log('Indexed DB is not available!!!');
        return;
      }
      alert("Indexed DB retrieved");
      // Get this object in 'self'
			var self = this;
			// Open DB
      this.request = indexedDB.open(this._dbName, this._dbVersion);
      //Once DB is opened
      request.onsuccess = function(event) {
      	//Store DB object in RecentsDBManager
        self.db = event.target.result;
        // --------------------------------------------
        // self.dbReady = true;
        if (!navigator.mozSms) {
        	self._prepopulateDB();
        }
        alert("callback if needed");
        // --------------------------------------------
        
        //Callback if needed
        if(callback){
        	callback();
        }
     	};

      request.onerror = function(event) {
        console.log('Database error: ' + event.target.errorCode);
      };

      request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objStore = db.createObjectStore('dialerRecents', { keyPath: 'date' });
        objStore.createIndex('number', 'number');
      };
    } catch (ex) {
    	// TODO Do we have to implement any custom error handler?
      console.log(ex.message);
    }
  },
  _checkDB: function rdbm_checkDB(callback) {
  	var self = this;
    if (!this.db) {
      this.request.addEventListener('success', function rdbm_DBReady() {
        self.request.removeEventListener('success', rdbm_DBReady);
        self._checkDB(callback);
      });
      return;
    }
    callback();
  },
  _add: function rdbm_add(recentCall) {
  	this._checkDB(function(){

  	
  		var txn = this.db.transaction('dialerRecents', 'readwrite');
      var store = txn.objectStore('dialerRecents');
      var self= this;
      var setreq = store.put(recentCall);
      setreq.onsuccess = function sr_onsuccess() {
        // TODO At some point with we will be able to get the app window
        // to update the view. Relying on visibility changes until then.
        // (and doing a full re-render)
        self.get();
      };

      setreq.onerror = function(e) {
        console.log('dialerRecents add failure: ', e.message, setreq.errorCode);
      };
    });
    
  },
  _prepopulateDB: function rdbm_prepopulateDB() {
    // var recentsEntry = {
    //   date: Date.now(),
    //   type: 'incoming-connected',
    //   number: '123123123'
    // };
    // this.add(recentsEntry);
    
  },
  _delete: function rdbm_delete() {

  },
  _get: function rdbm_get() {
    // var objectStore = this.db.transaction("dialerRecents").objectStore("dialerRecents");
    // var recents = []; 
    // objectStore.openCursor().onsuccess = function(event) {
    //   var cursor = event.target.result;
    //   if (cursor) {
    //     recents.push(cursor.value);
    //     cursor.continue();
    //   }
    //   else {
    //     alert(recents.length);
    //     Recents.render(recents);
    //   }
    // };


  }
};