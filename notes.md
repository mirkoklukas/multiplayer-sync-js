




var serverSync = function (state, effects, validate) {
	this.state = state;
	this.effects = effects;
	this.lastSequenceNumber = {};
	this.validateEvent = validate || funcion () { return true;};
};




