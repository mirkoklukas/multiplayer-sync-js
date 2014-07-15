// 	=============================================================================
// 	Entity blueprints for the client.
// 	=============================================================================

define(function () {

	var clientBlueprints = { 
	    spaceship: ["position", "visual", "lasercanon"],
	    asteroid: ["position", "visual", "dynamicBody"],
	    bullet: ["position", "visual", "dynamicBody"]
	};

	return clientBlueprints;
	
});
