
var effects = {
	RIGHT_ARROW: function (state) {
		state.entityDict[this.entityId].position[1] += 1;
	},
	LEFT_ARROW: function (state) {
		state.entityDict[this.entityId].position[1] -= 1;
	}
};

var stage = new Stage("canvas-container"),
	camera = new Camera({ 
		position: [0,0], 
		viewport: {
			lowerleft: [-100,-100],
			upperright: [100,100]
		}
	}, stage),
	renderer = new Renderer(stage, camera);

var mouse = new MouseEventSource("canvas-container"),
	keyboard = new KeyboardEventSource();

var gameClient = new GameClient(io, effects, keyboard);


var infinity = new AnimationFrameLoop(function () {
	stage.clear();
	gameClient.processServerPkgs();

	gameClient.state.entities.forEach(function (entity) {
		renderer.drawEntity(entity);
	});
});






