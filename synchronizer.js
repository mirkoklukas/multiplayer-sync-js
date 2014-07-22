// =============================================================================
//  Server-side Synchronizer.
// =============================================================================

// Import stuff.
var EventQueue = require("./shared/eventQueue.js")

// Our Synchronizer module.
var Synchronizer = function (io, effects, gameState, delay) {
    this.state = gameState;
	this.lastSequenceNumber = {};
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
			data.event.clientId = socket.id
			that.eventQueue.push(data.event);
	    });

		// Good bye and fare well.
		socket.on('disconnect', function () {
			console.log("Disconnected:", socket.id);
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






