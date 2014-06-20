// =============================================================================
//  A reasonable extensions 
// =============================================================================
// mathy version of a modulo operator
if(!Number.prototype.mod) { 
    Number.prototype.mod = function (b) {
        return ((this % b) + b) % b;
    };
};

// according to MDN part of the Harmony (ECMAScript 6) proposal
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
};

// according to MDN part of the Harmony (ECMAScript 6) proposal
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return i;
          }
        }
      }
      return -1;
    }
  });
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
// 	Events and Cause-bubbles
// =============================================================================
var defaultEffects = {
	test: function (state, queue) {
		console.log("test effect");
	}
};

var add = function (delta) {
	return function (t) {
		return t + delta;
	}
};

var Event = (function (defaultEffects) {
	var defaultEffects = defaultEffects || {};
	return function (config) {
			var effects = [],
				removeCallbacks = [];
			
			var config = config || {}; 
			this.type = config.type || "none";
			this.id = config.id || (+(String(+new Date()) + Math.floor(Math.random()*1000)));
			this.virtual = config.virtual || false;
			this.approved = config.approved || false;

			var attachedToCause = false;

			this.execute = function (state, queue) {
				console.log("---> " + this.type + " <id:" + this.id + ">" );
				effects.forEach(function (effect) {
					effect(state, queue);
				})
			};
			this.addEffect = function (effect) {
				if (effect instanceof Function)
					effects.push(bind(this, effect));
				return this;
			};
			this.default = function () {
				if(defaultEffects[this.type] !== undefined)
					this.addEffect(defaultEffects[this.type]);
				else
					throw "No default effect for type " + this.type;
			};
			this.clearEffects = function () {
				effects = [];
				return this;
			};
			this.isSolid = function () {
				return Boolean(causes[this.cause]);
			};
			this.addCause = function (cause) {
				if (!attachedToCause)
					cause.attachEvent(this);
				else throw "Event already attached to another cause...";
			};
			this.onRemove = function (callback) {
				removeCallbacks.push(callback);
			}
			this.remove = function () {
				removeCallbacks.forEach(function (callbak) {
					callback();
				});
			};
			this.chain = function (next, delta) {
				this.addEffect(function (state, queue) {
					queue.push(next, add(delta) )
				});
				this.onRemove(function () {
					next.remove();
				});
				return next;
			};
	};
}(defaultEffects));

var Cause = function () {
	var events = [];
	this.attachEvent = function (e) {
		events.push(e);
		return this;
	};
	this.collapse = function () {
		events.forEach(function (e) {
			e.remove();
		});
		return this;
	};
};

var eventChain = function (timedEvents) {
	var origin = timedEvents.shift(),
		next,
		prev = origin;
	while (timedEvents.length > 0) { 
		next = timedEvents.shift();
		prev[1].addEffect(function (state, queue) {
			queue.push(next[1], add(next[0]));
		});
		prev[1].onRemove(function () {
			next[1].remove();
		});
		prev = next; 
	};
	return origin[1];
};

// =============================================================================
//   
// =============================================================================
var EventQueue = function () { 
	this.delta = 1;
	this.events = [];
	this.history = [];
};

EventQueue.prototype.time = function () {
	return +new Date();
};

EventQueue.prototype.setTime = function (f) {
	this.time = f;
	return this;
};

EventQueue.prototype.push = function (e, now) {
	var now = now || (now instanceof Function) ? now(this.time()) : this.time();
		i = 0,
		timedEventTupel = [now, e]

	// make e removable from queue
	e.onRemove(bind(this, function () {
		var i = this.events.findIndex(function (tupel) {
			return tupel[1] === timedEventTupel[1];
		});

		this.events.splice(i,1);
		return e;
	}));

	//  push and keep ordered by time...
	this.events.push(timedEventTupel);
	this.events.sort(function (a, b) {
		return a[0] - b[0];
	});

	return this;
};

EventQueue.prototype.shift = function (delta, time) {
	var events = this.events,
		now = time || this.time(),
		delta = delta || 1;

		if (!this.events.length >0) return undefined

	//  note that we assume that the queue is ordered by
	//  time...
	if (Math.floor(events[0][0]/delta) <= Math.floor(now/delta)) {
		te = events.shift();
		this.history.push(te);
		return te[1];
	}
	else {  
		return undefined;
	}
};

EventQueue.remove = function (e) {
	var i = this.events.findIndex(function (tupel) {
		return tupel[1] === e;
	});

	this.events.splice(i,1);
};
// ==================================================
//  
// ==================================================



// ==================================================
//  
// ==================================================
var deepCopy = function (obj) {

};

var GameClient = function () {
	var t_sync = 0,
		localEvents = [],
		state = {},
		localState = {};

	// update the local event list, i.e. update the events corresponding
	// to the approved ones in the package
	this.updateLocalEvents = function (pkg) {
		var ids = pkg.processedIds;

		localEvents = localEvents.filter(function (timedEvent) {
			var id = timedEvent[1].id;
			return ids.indexOf(id) === -1; 
		});
	};

	// update the local state, i.e. if there is an approved event
	// at the beginning of the event list throw it at the world state
	var isNotApproved = function (timedEvent) {
		return timedEvent[1].approved !== true;
	};

	this.updateState = function (pkg) {
		t_sync = pkg.time;
		state = new World(pkg.state);
	};


	this.onPkgReceived = function (pkg) {
		this.updateLocalEvents(pkg);
		this.updateLocalState(pkg);
	};

	this.computeLocalState = function () {
		var events = localEvents.slice(),
			te = events.shift(),
			t = te[0],
			e = te[1];
		while (e && t <= now()) {
			
			te = events.shift(),
			t = te[0],
			e = te[1];
		}
	};
};



// ==================================================
//  
// ==================================================


