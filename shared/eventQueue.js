// =============================================================================
//  An event queue.
// =============================================================================

// The RequireJS optimizer, as of version 1.0.3, will strip out the use of 'amdefine' below, 
// so it is safe to use this module for your web-based projects too.
if (typeof define !== 'function') { var define = require('amdefine')(module); }

// Define the module. Do not pass an module name (as this only works in the browser)
// If no dependencies are handed to define they will be set to ['require', 'exports', 'module'].
define(function (require) {

	var EventQueue = function () {
		var events = [];
		var delay = 0;

		this.setDelay = function (delta) {
			delay = delta;
			return this;
		};
		this.getDelay = function () {
			return delay;
		};
		this.push = function (e) {
			e.time = e.time || +new Date();
			return events.push(e);
		};
		this.shift = function () {
			if (events[0] !== undefined && events[0].time <= +new Date() - delay) return events.shift();
			else return undefined; 
		};
		this.getEvents = function () {
			return events;
		}
	};

	return EventQueue;

});
