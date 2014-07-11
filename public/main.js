// 	=============================================================================
//  Main application code.
// 	=============================================================================

//  Configure Require-JS.
requirejs.config({
    baseUrl: '/',
    paths: {
        // shared: '../shared',
        comp: '..'
    },
    shim: {
    	'socket.io/socket.io': { exports: 'io' },
        'stuff' : { exports: 'stuff'}
        // 'keyboarder': { exports: 'Keyboarder' },
        // 'stage': { exports: 'Stage' },
        // 'camera': { exports: 'Camera' },
        // 'renderer': { exports: 'Renderer' },
        // 'accurateSetInterval': { exports: 'accurateSetInterval'} 
    }
});

// 	Run main application.
require(["game"], function (Game) {
	var game = new Game();
	game.run();
});