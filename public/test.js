
// Keyboard input tracking
// -----------------------

// **new Keyboarder()** creates a new keyboard input tracking object.
var Keyboarder = function() {

    // Records up/down state of each key that has ever been pressed.
    var keyState = {};

    // When key goes down, record that it is down.
    window.onkeydown = function(e) {
    	keyState[e.keyCode] = true;
    };

    // When key goes up, record that it is up.
    window.onkeyup = function(e) {
    	keyState[e.keyCode] = false;
    };

    // Returns true if passed key is currently down.  `keyCode` is a
    // unique number that represents a particular key on the keyboard.
    this.isDown = function(key) {
    	if (typeof key === "string" && key.length === 1) 
    		return keyState[key.toUpperCase().charCodeAt(0)] === true;
      	else 
      		return keyState[keyCode] === true;
    };
    this.pressed = function (keyLabel) {
        if(!(keyLabel instanceof Array)) 
            return keyState[keyCodeByLabel[keyLabel]] === true;
        else
            return keyLabel.filter(function (label) {
                return keyState[keyCodeByLabel[label]] === true;
            });
    };

    var keyCodeByLabel = { 
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        INSERT: 45,
        DELETE: 46,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUM_LOCK: 144,
        SCROLL_LOCK: 145,
        SEMI_COLON: 186,
        EQUALS: 187,
        COMMA: 188,
        DASH: 189,
        PERIOD: 190,
        FORWARD_SLASH: 191,
        GRAVE_ACCENT: 192,
        OPEN_SQUARE_BRACKET: 219,
        BACK_SLASH: 220,
        CLOSE_SQUARE_BRACKET: 221,
        SINGLE_QUOTE: 222 
    };
};

var entityBlueprints = { 
    spaceship: ["position", "visual", "lasercanon"],
    asteroid: ["position", "visual"],
    bullet: ["position", "visual", "dynamicBody"]
};

var entityComponents = {
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
    },
    visual: function (obj) {
        switch (obj.type) {
        case 'spaceship':
            obj.size = [30,20];
            obj.color = "#000";
            obj.render = function (renderer) {
                renderer.drawSpaceship(this);
            };
            break;
        case 'asteroid':    
            obj.size = [30,30];
            obj.color = "#f00";
            obj.render = function (renderer) {
                renderer.drawEntity(this);
            };
            break;
        case 'bullet':
            obj.size = [4,1];
            obj.color = "#f00";
            obj.render = function (renderer) {
                renderer.drawEntity(this);
            };
            break;
        }
    },
    keyboard: function (obj) {
        // React to input.
        obj.updates.push(function (delta) {
            // NOTE: `this` will become the entity where the update function is called on
            var pressedArrowKeys = this.game.keyboard.pressed(["LEFT_ARROW", "UP_ARROW", "RIGHT_ARROW", "DOWN_ARROW"]);

            if(pressedArrowKeys.length > 0) {
                pressedArrowKeys.forEach(bind(this, function (key) {
                    this.game.synchronizer.feedEvent(key, {entityId: this.id});
                }));
            }
            if(this.game.keyboard.pressed("SPACE")) { 
                
                this.game.synchronizer.feedEvent("shoot", {entityId: this.id});
            }
            
        });
    },
    lasercanon: function (obj) {
        obj.shoot = function () {
            console.log("SHOOT", this.id);
        };
    }
};

var EntityConstructorFactory = function (game, entityBlueprints, entityComponents) { 

    var Entity =  function (type) {
        this.game = game;
        this.type = type; 
        this.components = []; 
        this.updates = []; 

        // Initialize according to the blueprint of respective type
        this.addComponent(entityBlueprints[type]);
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
    }
};



var Game = function () {

    // Initialize Constructors: Entity and GameState.
    var Entity = EntityConstructorFactory(this, entityBlueprints, entityComponents);
    var GameState = GameStateConstructorFactory(Entity);

    // Set up Level and so on.
    this.map = {};
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



    accurateSetIntervall(20, bind(this, function (delta) {
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

// keyboard.onAny(bind(this, function (type, data) {
//     console.log("Event:", type, data);
//     var e = data;
//     if(type === "keydown") { 
//     	switch (data.keyLabel) {
//     	// --------------------
//     	case "LEFT_ARROW":
//     	case "RIGHT_ARROW":
//     	case "UP_ARROW":
//     	case "DOWN_ARROW":
//     		syncState.feedEvent(data.keyLabel, data);
//     		break;
//     	// --------------------
//     	case "SPACE":
//     		syncState.feedEvent("bullet", {
//     			velocity: [0,1]
//     		});
//     		break;
//     	// --------------------
//     	}
//     }
// }));

var game = new Game();
game.run();








