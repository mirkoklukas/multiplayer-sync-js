// 	The RequireJS optimizer, as of version 1.0.3, will strip out the use of 'amdefine' below, 
// 	so it is safe to use this module for your web-based projects too.
if (typeof define !== 'function') { var define = require('amdefine')(module); }

// 	Define the module. Do not pass an module name (as this only works in the browser)
// 	If no dependencies are handed to define they will be set to ['require', 'exports', 'module'].
define(function (require) {

	var accurateSetinterval = function (callback, delay) {

		var delay = delay,
			now = +new Date(),
			start = now,
			last = now,
			error = 0,
			count = 0;

		// Function called at each iteration of the timer;
		var tick = function () {
			// Right now. 
			now = +new Date();

			// Error is given by: (Actual position in time) - (sheduled position in time)
			error = (now - start) - (count*delay);

			// Shedule the next call of `tick` and adjust with respect to the error
			setTimeout(tick, delay - error);

			// Do something... with respect to the time passed since last tick
			callback(now - last);
			
			// Console output for test purposes.
			// console.log("Sheduled position:", count*delay, "Actual position:", now - start, "Error:", error, "Delta:", now - last);
			
			last = now;
			count ++;
		};

		// Start the cycle.
		setTimeout(tick, delay);

	};

	return accurateSetinterval;
});