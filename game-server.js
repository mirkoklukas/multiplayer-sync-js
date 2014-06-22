

// =============================================================================
//  
// =============================================================================

// =============================================================================
//  The Game Server.
// =============================================================================
var GameServer = function(io) {
	// Connected clients and their entities.
	this.clients = [];
	this.state = new GameState();
	this.t_sync = 0;

	// List of processed events for each client.
	this.processedEvents = [];
	this.EventQueue = [];

	this.io = io;
	this.initialize();
};

GameServer.prototype.initialize = function () {
	var io = this.io;
	io.sockets.on('connection', function (socket) {

		// A new Client/Player joined
		socket.emit("welcome", {
			"msg": "You're connected..." + socket.id,
			"id": socket.id
		});

		socket.broadcast.emit('new player', { 
			'msg': socket.id + " joined...", 
			'id': socket.id
		});

		socket.on('disconnect', function () {
			console.log('Disconnect: ' + socket.id);
			socket.broadcast.emit('player left', { 
				msg: socket.id + " left..."
			});
	    });
	});
}

GameServer.prototype.sendPkg = function () {
	var now = +new Date()
	// Create and fill the package, 
	// and clear the list of processed events.
	var pkg = {
		time: now,
		entities: this.state.entities,
		processedEvents: this.processedEvents
	};

	this.t_sync = now;
	this.processedEvents = [];
	// Eventually send out the package.
	this.io.sockets.emit("server package", {
		"msg": "Hey, here's a server update package... ",
		"pkg": pkg
	});
};

GameServer.prototype.validateEvent = function () {
	// TO DO: add something non-trival here :)
	return true;
};

GameServer.prototype.processEvents = function () {
	while(true) {
		var e = this.EventQueue.shift();
		if(!e) break;

		// 
		if (this.validateEvent(e)) {
			e.execute(this.state, this.EventQueue);
			this.processedEvents.push(e.id);
		} else {
			throw "GameServer.processEvents(...): This Event doesn't seem to make sense.... ?!"
		}
	}
};








