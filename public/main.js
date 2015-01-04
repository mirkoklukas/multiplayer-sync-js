// 	=============================================================================
//  Main application code.
// 	=============================================================================

//  Configure Require-JS.
requirejs.config({
    baseUrl: '/',
    paths: {
        comp: '..'
    },
    shim: {
    	'socket.io/socket.io': { exports: 'io' },
        'stuff' : { exports: 'stuff'}
    }
});

// 	Run main application.
require(["game"], function (Game) {
	var game = new Game();
	game.run();
});