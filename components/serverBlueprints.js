// 	=============================================================================
// 	Entity blueprints for the server.
// 	=============================================================================

var serverBlueprints = { 
    spaceship: ["position", "lasercanon"],
    asteroid: ["position", "dynamicBody"],
    bullet: ["position", "dynamicBody"]
};

module.exports = serverBlueprints;

