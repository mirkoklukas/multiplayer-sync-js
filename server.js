// =============================================================================
//  The game server.
// =============================================================================

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
app.use(express.static(__dirname + '/shared'));
app.use(express.static(__dirname + '/components'));

app.get('/', function(req, res){
	res.sendfile("./public/index.html");
});

//  Create a game instance and run it.
var game = new (require("./game.js"))(io);
game.run();








