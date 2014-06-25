// Set everything up.
var express = require('express'), 
	app = express(),
	server = require('http').Server(app), 
	io = require('socket.io')(server),
	port = process.env.PORT || 3000;

server.listen(port, function() {
    	console.log('The magic happens at: localhost:%d', server.address().port);
	});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendfile("./public/index.html");
});


// Effects to be called on event objects. 
// This object should exist on client side as well.
var effects = {
	RIGHT_ARROW: function (state) {
		state.entityDict[this.entityId].position[1] += 1	;
	},
	LEFT_ARROW: function (state) {
		state.entityDict[this.entityId].position[1] -= 1;
	}
};

// Create the game server.
var GameServer = require("./game-server.js"),
	gameServer = new GameServer(io, effects);

// Update cycle.
var infinity = setInterval(function () {
	gameServer.sendPkg();
	gameServer.processEvents();
}, 3000);


