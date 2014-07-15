// 	=============================================================================
// 	Entity blueprints.
// 	=============================================================================

define(["entity"], function (Entity) {



	// The client components.
	var clientComponents = { 
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
	    visual: function (obj) {
	    	switch (obj.type) {
	    	case "spaceship":
	    		obj.size = [10,10];
	    		obj.color = "#000";
	    		break;
	    	case "bullet":
	    		obj.size = [5,5];
	    		obj.color = "#f00";
	    		break;
	    	}
	    	obj.render = function (renderer) {
	    		console.log("123");
	    		renderer.drawEntity(this);
	    	};
	    },
	    keyboard: function (obj) {
	        // React to input.
	        obj.updates.push(function (delta) {
	            // NOTE: `this` will become the entity where the update function is called on
	            if(this.getGame().keyboard.pressed("d"))
	                console.log("d");
	                // this.getGame().synchronizer.feedEvent("position update", {});
			});
	    },
	    lasercanon: function (obj) {
	        obj.shoot = function () {
	            console.log("SHOOT", this.id);
	            var bullet = new Entity("bullet").setPosition(this.position.slice()).setVelocity([0.5,0]);
	            this.getGame().gameState.addEntity(bullet);
	        };
	    }
	};

	return clientComponents;

});
