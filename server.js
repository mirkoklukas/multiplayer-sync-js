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

var effects = {
    RIGHT_ARROW: function (state) {
        state.entityDict[this.entityId].position[0] += 1;
    },
    LEFT_ARROW: function (state) {
        state.entityDict[this.entityId].position[0] -= 1;
    },
    UP_ARROW: function (state) {
        state.entityDict[this.entityId].position[1] += 1;
    },
    DOWN_ARROW: function (state) {
        state.entityDict[this.entityId].position[1] -= 1;
    },
    shoot: function (state) {
        var id = this.entityId;
        state.entityDict[id].shoot();
    }
};


// Create the game server.

var accurateSetintervall = require("./shared/accurateSetinterval.js")

var Game = function () {
    
    // Import.
    var Synchronizer = require("./synchronizer.js"),
        Entity = require("./shared/entity.js"),
        GameState = require("./shared/gameState"),
        blueprints = require("./components/serverBlueprints.js"),
        components = require("./components/serverComponents.js");

    Entity.setBlueprints(blueprints).setComponents(components);
    
    // Config.
    this.intervalLength = 200;

    // Level.
    this.map = {};
    this.gameState = new GameState();

    // Initialize game state etc...
    // ...

    // Set up synchronization.
    this.synchronizer = new Synchronizer(io, effects, this.gameState, this.intervalLength);
    var that = this;
	this.synchronizer.onConnection = function () {
		var spaceship = new Entity("spaceship").setPosition([Math.random()*100, Math.random()*100]),
			spaceshipId = that.gameState.addEntity(spaceship),
			welcomePkg = { spaceshipId: spaceshipId };

		return welcomePkg;
	};
};


Game.prototype.run = function () {
	// Update cycle.
	var that = this;


    accurateSetintervall(function (delta) {
        that.gameState.entities.forEach(function (entity) {
            entity.update(delta);
        });
        that.synchronizer.processEvents();
    }, 20);

    accurateSetintervall(function (delta) {
		console.log("Send Package...");
		that.synchronizer.sendPkg();
	}, this.intervalLengthc);
};

Game.prototype.colliding = function (b1, b2) {
    return !(
      b1 === b2 ||
        b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
        b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
        b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
        b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
    );
};


var game = new Game();
game.run();








