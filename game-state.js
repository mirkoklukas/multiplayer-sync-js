// =============================================================================
//  The Game State. It consists of entitities that populate the world...
// =============================================================================

var uuid = require("uuid");

var GameStateConstructorFactory = function (Entity) { 

	var GameState = function () {
		this.entities = [];
		this.entityDict = {};
	};	

	GameState.prototype.addEntity = function (entity) {
		console.log("GameState.prototype.addEntity(...):", entity)
		if (!entity.id) 
			entity.id = uuid.v4();

		this.entityDict[entity.id] = entity;
		this.entities.push(entity);
		
		return entity.id;
	};

	GameState.prototype.removeEntity = function (id) {
		// Remove from dict
		delete this.entityDict[id];
		
		// Remove from list
		var i = this.entities.findIndex(function (entitiy) {
			return entitiy.id === id;
		});
		this.entities.splice(i,1);
		
		return this;
	};

	GameState.prototype.update = function (data) {
		var id = data.id;

		if (!this.entityDict[id]) 
			this.addEntity(new Entity(data.type).addDiff(data));
		else 
			this.entityDict[id].addDiff(data);

		return this;
	};

	return GameState;

};

module.exports = GameStateConstructorFactory;