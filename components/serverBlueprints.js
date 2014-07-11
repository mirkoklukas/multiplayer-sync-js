// 	=============================================================================
// 	Entity blueprints for the server.
// 	=============================================================================

var clientBlueprints = { 
    spaceship: ["position", "visual", "lasercanon"],
    asteroid: ["position", "visual", "dynamicBody"],
    bullet: ["position", "dynamicBody"]
};

module.exports = clientBlueprints;

