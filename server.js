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


var entityBlueprints = { 
    spaceship: ["position", "visual", "lasercanon"],
    asteroid: ["position", "visual", "dynamicBody"],
    bullet: ["position", "dynamicBody"]
};

var entityComponents = function (Entity) {
    return { 
        position: function (obj) {
            obj.position = [0,0];
            obj.setPosition = function (position) {
            	this.position = position;
            	return this;
            };
        },
        dynamicBody: function (obj) {
            obj.velocity = [0,0];
            obj.updates.push(function(delta) {
                this.position[0] += delta*this.velocity[0];
                this.position[1] += delta*this.velocity[1];
            });
            obj.setVelocity = function (velocity) {
                this.velocity = velocity;
                return this;
            };
        },
        keyboard: function (obj) {
            // React to input.
            obj.updates.push(function (delta) {
                // NOTE: `this` will become the entity where the update function is called on
                if(this.game.keyboard.pressed("d"))
                    console.log("d");
                    // this.game.synchronizer.feedEvent("position update", {});
    		});
        },
        lasercanon: function (obj) {
            obj.shoot = function () {
                console.log("SHOOT", this.id);
                var bullet = new Entity("bullet").setPosition(this.position.slice()).setVelocity([60,0]);
                this.getGame().gameState.addEntity(bullet);
            };
        }
    };
};

var EntityConstructorFactory = function (game, entityBlueprints, entityComponents) { 
    // The game's entity constructor.
    var Entity =  function (type) {
        // this.game = game;
        this.type = type; 
        this.components = []; 
        this.updates = []; 

        // Initialize.
        this.init();
    };

    var entityBlueprints = entityBlueprints,
        entityComponents = entityComponents(Entity);

    Entity.prototype.init = function () {
        this.addComponent(entityBlueprints[this.type]);
    };

    Entity.prototype.getGame = function () {
        return game;
    };

    Entity.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    Entity.prototype.update = function (delta) {
        var that = this;
        this.updates.forEach(function (update) {
            update.call(that, delta);
        });
        return this;
    };

    Entity.prototype.addDiff = function (data) {
        update(this, data);
        return this;
    };

    Entity.prototype.addComponent = function (type) {
        var types = type instanceof Array ? type : [type];
        
        this.components = this.components.concat(types);

        var that = this;
        types.forEach(function (type) {
            if (entityComponents[type]) 
                entityComponents[type].call(null, that);
            else 
                console.log("Entity.prototype.addComponent(): No component for this type:", type);
        });

        return this;
    };

    return Entity;
};



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

var Game = function () {
    
    var Synchronizer = require("./game-server.js"),
	    Entity = EntityConstructorFactory(this, entityBlueprints, entityComponents),
	    GameState = require("./game-state.js")(Entity);
	
    // Level.
    this.map = {};
    this.gameState = new GameState();

    // Initialize game state etc...
    // ...

    // Set up synchronization.
    this.synchronizer = new Synchronizer(io, effects, this.gameState);
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
	var infinity = setInterval(function () {
		console.log("Tick...");
		that.synchronizer.sendPkg();
		that.synchronizer.processEvents();
		that.gameState.entities.forEach(function (entity) {
			entity.update(0.2);
		});
	}, 200);
};

var game = new Game();
game.run();








