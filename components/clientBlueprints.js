// 	=============================================================================
// 	Entity blueprints for the client.
// 	=============================================================================

define(function () {

	var clientBlueprints = { 
	    spaceship: ["position", "visual", "lasercanon"],
	    asteroid: ["position", "visual", "dynamicBody"],
	    bullet: ["position", "dynamicBody"]
	};

	return clientBlueprints;
	
});
