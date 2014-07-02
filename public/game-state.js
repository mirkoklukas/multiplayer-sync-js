// =============================================================================
//  The Game State. 
// 	It consists of entitities that populate the world. It needs to know about how
// 	to create entities...
// =============================================================================

var GameStateConstructorFactory = function (Entity) { 

	var GameState = function () {
		this.entities = [];
		this.entityDict = {};
	};	

	GameState.prototype.addEntity = function (entity) {
		console.log(entity);
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

		// Creating a new entity fills its updates array, we dont want to 
		// replace that by the received array, which contains only 
		// `null` values anyway (since it comes via the socket connection, 
		// i.e. its a JSON object and `functions` are replaced with `null`)
		delete data.updates;
		delete data.components;

		if (!this.entityDict[id]) 
			this.addEntity(new Entity(data.type).addDiff(data));
		else 
			this.entityDict[id].addDiff(data);

		return this;
	};

	return GameState;

};

// exports.GameState = GameState;