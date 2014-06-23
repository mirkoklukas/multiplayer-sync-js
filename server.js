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

var defaultEffects = {
	test: function (state, queue) {
		console.log("test effect");
	}
};

var effects = {
	moveRight: function (state) {
		state.entityDict[this.entityId].position[0] += 10;
	},
	moveLeft: function (state) {
		state.entityDict[this.entityId].position[0] -= 10;
	},
	test: function (state) {
		console.log("test effect");
	}
};


// var Event = require("./sync.js").EventFactory(defaultEffects);


var GameServer = require("./game-server.js");
var gameServer = new GameServer(io, effects);


