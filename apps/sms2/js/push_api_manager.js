/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var PushManager = {
	registrations : [],
	init: function pm_init() {
		// TODO Check if needed
	},
	getRegistrations: function pm_getRegistrations() {
		// if (this.registered) {
		// 	return registrations;
		// }
		// var self = this;
		// asyncStorage.getItem('push.registrations', function _onValue(registrations) {
		// 	if (!registrations) {
				return false;
		// 	}
		// 	this.registered = true;
		// 	self.registrations = registrations;
		// 	return registrations;
		// });
	},
	register: function pm_register(registrations) {
		// Clean registrations
		this.registrations = [];
		var self = this;
		// Per each Im gonna create a registration to push API
		registrations.forEach(function(registration) {
			console.log('navigator.pushNotification ----->' + navigator.pushNotification);
			var request = navigator.pushNotification.register();
			console.log('request ----->' + request);
			request.onsuccess = function successManager(e) {
				var endPoint = e.target.result.pushEndpoint;
			  self.registrations.push({
			  													'name': name,
			  													'pushEndpoint': endPoint,
			  													'handler': registration.action
			  												});
			  registration.callback(endPoint);
			}
		});
		
		// We store all registrations
		asyncStorage.setItem('push.registrations', this.registrations, function() {
   		// At the end we set as registered
			self.registered = true;
   	});
	},

	unregister: function pm_unregister() {
		this.registrations.forEach(function(registration){
			navigator.pushNotification.unregister(registration.pushEndpoint);
		});
	}
}