






var AccurateTimer = function (delay, callback) {

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

module.exports = AccurateTimer;