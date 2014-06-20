



updateLookup = {
	"type-A" : function (delta) {
		this.x = this.x + delta*this.vel;
	}
};


var stateUpdate = function (state, delta) {
	state.entities.forEach(function (entity) {
		updateLookup[entity.type].call(entity, delta);
	});
};




<!-- problem is that we cant really interchange states -->


entity `bind` f:E-->E
