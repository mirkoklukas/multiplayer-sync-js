
var effects = {
	moveRight: function (state) {
		state.entityDict[this.entityId].position[0] += 10;
	},
	moveLeft: function (state) {
		state.entityDict[this.entityId].position[0] -= 10;
	},
	test: function (state) {
		console.log("test effect");
	},
	unknown: function (state) {

	}
};



var mouse = new MouseEventSource("canvas-container"),
	keyboard = new KeyboardEventSource();

var client = new GameClient(io, effects, keyboard);