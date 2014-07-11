// 	=============================================================================
// 	The synchronizer.
// 	=============================================================================

// 	The RequireJS optimizer, as of version 1.0.3, will strip out the use of 'amdefine' below, 
// 	so it is safe to use this module for your web-based projects too.
if (typeof define !== 'function') { var define = require('amdefine')(module); }

// 	Define the module. Do not pass an module name (as this only works in the browser)
// 	If no dependencies are handed to define they will be set to ['require', 'exports', 'module'].
define(function (require) {

	var Synchronizer = function (io, effects, gameState) {
		this.id = null;
		this.state = gameState;
		this.effects = effects;
		this.lastSequenceNumber = 0;

	};



});