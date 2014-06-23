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
//  The Game Server.
// =============================================================================

var GameState = require("./game-state.js")

var GameServer = function (io, effects) {
	// Connected clients and their entities.
	this.state = new GameState();
	this.t_sync = 0;
	this.effects = effects;

	// List of processed events for each client.
	this.lastSequenceNumber = {}
	this.eventQueue = [];

	this.io = io;
	this.initialize();
};

GameServer.prototype.initialize = function () {
	var io = this.io,
		that = this;

	io.sockets.on('connection', function (socket) {

		// A new client (player) joined.
		socket.emit("welcome", {
			"msg": "You're connected... " + socket.id,
			"id": socket.id
		});

		// Tell all others about the new player in town.
		socket.broadcast.emit('new player', { 
			'msg': socket.id + " joined...", 
			'id': socket.id
		});

		// Something happend at the other side of the tube.
		socket.on('client event', function (data) {
			var e = data.event;
			update(e, { 
				clientId: socket.id
			});
			that.eventQueue.push(e);
	    });

		// Good bye and fare well.
		socket.on('disconnect', function () {
			delete that.client[socket.id];
			socket.broadcast.emit('player left', { 
				msg: socket.id + " left...",
				id: socket.id
			});
	    });
	});
};

GameServer.prototype.sendPkg = function () {
	// Update sync time.
	this.t_sync = +new Date();
	// Create and fill the package, 
	// and clear the list of processed events.
	var pkg = {
		entities: this.state.entities,
		lastSequenceNumber: this.lastSequenceNumber
	};
	// Eventually send out the package.
	this.io.sockets.emit("server package", {
		"msg": "Hey, here's a server update package... ",
		"pkg": pkg
	});
};

GameServer.prototype.validateEvent = function (e) {
	// TO DO: add something non-trival here :)
	return true;
};

GameServer.prototype.processEvents = function () {
	while(true) {
		var e = this.eventQueue.shift();
		if(!e) break;

		if (this.validateEvent(e)) {
			this.effects[e.type].call(e, this.state);
			this.lastSequenceNumber[e.clientId] = e.sequenceNumber;
		} else {
			throw "GameServer.processEvents(...): This Event doesn't seem to make sense.... ?!"
		}
	}
};

module.exports = GameServer;






