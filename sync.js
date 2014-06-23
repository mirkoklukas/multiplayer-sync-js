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


var EventFactory = function (defaultEffects) {
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
				});
				return state;
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
};

exports.EventFactory = EventFactory;







