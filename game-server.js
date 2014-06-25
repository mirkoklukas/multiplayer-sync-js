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
var Entity = function (type, id, position, size, color) {
	this.type = type;
	this.id = id;
	this.position = position || [Math.random()*100, Math.random()*100];
	this.size = size || [10, 10];
	this.color = color || "#000";
};

// =============================================================================
//  The Game Server.
// =============================================================================

var GameState = require("./game-state.js")

var GameServer = function (io, effects) {
	this.state = new GameState();
	this.t_sync = 0;
	this.effects = effects;
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
		// Tell him his socket.id and create an avatar.
		socket.emit("welcome", {
			"msg": "You're connected... " + socket.id,
			"id": socket.id
		});
		that.state.addEntity(new Entity("avatar", socket.id));


		// Tell all others about the new player in town.
		socket.broadcast.emit('new player', { 
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

module.exports = GameServer;






