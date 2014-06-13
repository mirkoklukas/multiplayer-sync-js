// =============================================================================
//  A reasonable extension in my opinion 
// =============================================================================
if(!Number.prototype.mod) { 
    Number.prototype.mod = function (b) {
        return ((this % b) + b) % b;
    };
};

// =============================================================================
// 	Helper
// =============================================================================
var bind = function(that, f) {
  return function() {
    return f.apply(that, arguments);
  }
};

// =============================================================================
// 	
// =============================================================================
var Event = (function (defaultEffects) {
	return function (type, id, virtual) {
		this.type = type;
		this.id = id;
		this.virtual = virtual;
		var effects = [];
		this.execute = function (state, queue) {
			console.log("Event <" + this.id + "> executed --> " + this.type);
			effects.forEach(function (effect) {
				effect(state, queue);
			})
		};
		this.addEffect = function (effect) {
			if (effect instanceof Function)
				effects.push(bind(this, effect));
			return this;
		};
		this.clearEffects = function () {
			effects = [];
			return this;
		};
	};
}());


var defaultEffects = {
	"test": function (state, queue) {
		console.log("test effect");
	}
};

var createEvent = (function (defaultEffects) {
	var defaultEffects = defaultEffects,
		cause = {};
	return function (type, id, causeId) {
		var virtual = false;
		if (causeId !== undefined) {
			cause[causeId] = (cause[causeId] || {})[id] = true;
			virtual = true;
		}
		return new Event(type, id, virtual).addEffect(defaultEffects[type])
	};
}(defaultEffects));


var explosionEvent = createEvent("explosion", 1).clearEffects().addEffect(function (state, queue) {

	var now = Number(new Date()),
		decendant = createEvent("evolve explosion", "" + this.id + "-descendant-" + 1, 1)
						.clearEffects()
						.addEffect(function (state, queue) {

						});



	queue.



});






// =============================================================================
//   
// =============================================================================
var EventQueue = function () { 
	this.events = [];
};

EventQueue.prototype.push = function (e, now) {
	var now = now || Number(new Date()),
		i = 0;

	//  push and keep ordered by time...
	events.push([now, e]);
	events.sort(function (a, b) {
		return a[0] - b[0];
	});
};

EventQueue.prototype.shift = function (delta) {
	var events = this.events,
		now = +new Date(),
		delta = delta || 1;

	//  note that we assume that the queue is ordered by
	//  time...
	if (events[0][0].mod(delta) <= now.mod(delta))
		return events.shift()[1];
	else 
		return undefined;
};

// ==================================================
//  
// ==================================================




// ==================================================
//  
// ==================================================

// ==================================================
//  
// ==================================================



