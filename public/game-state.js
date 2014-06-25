// =============================================================================
//  The Game State. It consists of entitities that populate the world...
// =============================================================================
var GameState = function () {
	this.entities = [];
	this.entityDict = {};
};

GameState.prototype.addEntity = function (entity) {
	// TO DO: Check if id is already taken
	var id = entity.id;
	this.entityDict[id] = entity;
	this.entities.push(entity);
	return id;
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

GameState.prototype.updateEntity = function (entity) {
	// NOTE: update() is defined in helper.js
	// One could also remove old entity entry and replace by the new one.
	// The current implementation also works if we hand in an update object...
	var id = entity.id;
	if (!this.entityDict[id]) 
		this.addEntity(entity);
	else 
		update(this.entityDict[id], entity);
	return this;
};

// exports.GameState = GameState;