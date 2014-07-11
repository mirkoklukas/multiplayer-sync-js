// 	=============================================================================
//  The Game object.
// 	=============================================================================





define( ["entity", "gameState", "synchronizer", "comp/clientBlueprints", "comp/clientComponents", "stuff", "socket.io/socket.io"], 
function (Entity, GameState, Synchronizer, blueprints, components, stuff, io) {
	console.log(stuff)
	var accurateSetInterval = stuff.accurateSetInterval;
	var Keyboarder = stuff.Keyboarder;
	var Camera = stuff.Camera;
	var Stage = stuff.Stage;
	var Renderer = stuff.Renderer;

    var bind = function(that, f) {
        return function() {
            return f.apply(that, arguments);
        }
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
	    }
	};

	var Game = function () {

		// Tell the entities which game the populate.
	    Entity.setGame(this).setBlueprints(blueprints).setComponents(components);

	    // Instanciate.
	    this.gameState = new GameState();
	    this.synchronizer = new Synchronizer(io, effects, this.gameState);
	    this.keyboard = new Keyboarder();
	    this.stage = new Stage("canvas-container");
	    this.camera = new Camera({ 
	        position: [0,0], 
	        viewport: {
	            lowerleft: [-100,-100],
	            upperright: [100,100]
	        }
	    }, this.stage);
	    this.renderer = new Renderer(this.stage, this.camera);

	    // Initialize game state etc...
	    // ...

	    // Set up synchronization.
	    var that = this;
	    this.synchronizer.onWelcome = function (welcomePkg) {
	        // Receive the id of the spaceship that has been 
	        // assigned to you and add it to your entities
	        var id = welcomePkg.spaceshipId,
	            spaceship = new Entity("spaceship").setId(id).addComponent("keyboard");
	        // Add the spaceship under your control
	        that.gameState.addEntity(spaceship);
	    };

	};

	Game.prototype.update = function (delta) {
	    this.gameState.entities.forEach(function (entity) {
	        entity.update(delta);
	    });
	};

	Game.prototype.run = function () {
	    console.log("Game.prototype.run().")

	    var now = +new Date(),
	        lastTick = now;

	    accurateSetInterval(20, bind(this, function (delta) {
	        this.synchronizer.processServerPkgs();
	        this.synchronizer.remoteReplay();
	        this.gameState.entities.forEach(function (entity) {
	            entity.update(delta);
	        });
	    }));

	    var infinity = new AnimationFrameLoop(bind(this, function () {
	        this.stage.clear();
	        this.gameState.entities.forEach(bind(this, function (entity) {
	            entity.render(this.renderer);
	        }));
	    }));
	};

	return Game;
});
