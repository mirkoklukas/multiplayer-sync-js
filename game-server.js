// =============================================================================
// 	Helper
// =============================================================================
var bind = function(that, f) {
	return function() {
    	return f.apply(that, arguments);
  	}
};

var update = function (obj, changes) {
	for (key in changes) {
		if (typeof obj[key] !== "object")
			obj[key] = changes[key]
		else
			update(obj[key], changes[key]);
	}
  return obj;
};

// =============================================================================
//  
// =============================================================================


// =============================================================================
//  The Game Server.
// =============================================================================

var GameState = require("./game-state.js");


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


var Synchronizer = function (io, effects, gameState, delay) {

    this.state = gameState;
	this.lastSequenceNumber = {}
	this.effects = effects;
	this.eventQueue = new EventQueue().setDelay(delay);
	this.io = io;
	this.initialize();
};

Synchronizer.prototype.onConnection = function () {
	console.log("SyncStateServer.onConnection(): Not implemented yet...");
	return null;
}

Synchronizer.prototype.initialize = function () {
	var io = this.io,
		that = this;

	io.sockets.on('connection', function (socket) {
		console.log("New Connection:", socket.id)
		// A new client (player) joined. Create his spaceship and tell him his 
		// socket id and the entity id of his spaceship
		var data = that.onConnection();
		
		socket.emit("welcome", {
			"msg": "You're connected... " + socket.id,
			"id": socket.id,
			"connectionPkg": data
		});

		// Tell all others about the new player in town.
		socket.broadcast.emit('new client', { 
			'msg': socket.id + " joined...", 
			'id': socket.id
		});



		// Something happend at the other side of the tube.
		socket.on('client event', function (data) {
			console.log("Client event received", data.event);
			var e = data.event;
			update(e, {
				clientId: socket.id
			});
			that.eventQueue.push(e);
	    });

		// Good bye and fare well.
		socket.on('disconnect', function () {

			socket.broadcast.emit('client left', { 
				msg: socket.id + " left...",
				id: socket.id
			});
	    });
	});
};

Synchronizer.prototype.sendPkg = function () {
	// Create and fill the package, 
	// and clear the list of processed events.
	var pkg = {
		time: +new Date() - this.eventQueue.getDelay(),
		entities: this.state.entities,
		replayEvents: this.eventQueue.getEvents(),
		lastSequenceNumber: this.lastSequenceNumber
	};
	// Eventually send out the package.
	this.io.sockets.emit("server package", {
		"msg": "Hey, here's a server update package... ",
		"pkg": pkg
	});
};

Synchronizer.prototype.validateEvent = function (e) {
	// TO DO: add something non-trival here :)
	return true;
};

Synchronizer.prototype.processEvents = function (time) {
	while(true) {
		var e = this.eventQueue.shift();
		if(!e) break;

		if (this.validateEvent(e)) {
			var effect = this.effects[e.type];
			
			if (effect) { 
				effect.call(e, this.state);
			} else { 
				console.log("Undefined effect... ", e.type);
			}

			this.lastSequenceNumber[e.clientId] = e.sequenceNumber;
		} else {
			console.log("GameServer.processEvents(...): This Event doesn't seem to make sense.... ?!");
		}
	}
};

module.exports = Synchronizer;






