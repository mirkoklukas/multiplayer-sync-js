// =============================================================================
//  Some stuff.
// =============================================================================
var AnimationFrameLoop = function (update) {
	var requestAnimationFrame = window.requestAnimationFrame || 
								window.mozRequestAnimationFrame ||
                              	window.webkitRequestAnimationFrame || 
                              	window.msRequestAnimationFrame;

	requestAnimationFrame(function tick() {
		update();
		requestAnimationFrame(tick);
	});
};

// =============================================================================
//  
// =============================================================================
var makeObservable = function (obj) {
	var callbacks =  {};

	obj.on =  function (type, f) {
		(callbacks[type] = callbacks[type] || []).push(f);
		return obj;
	};

	obj.fire = function (type, data) {
		var args = [].slice.call(arguments, 1);
		(callbacks[type] || []).map(function (f) {
			f.apply(obj, args || null);
		});
		
		(callbacks["any"] || []).map(function (f) {
			f.apply(obj, [type].concat(args) );
		});
		return obj;
	};

	obj.fireMany = function (events) {
		var that = this;
		events.map(function (args) {
			that.fire.apply(that, args);
		});
	};
	
	obj.onAny = function (f) {
		(callbacks["any"] = callbacks["any"] || []).push(f);
		return obj;
	};

	return obj;
};

var MouseEventSource = function (elementId) {
	var element = window.document.getElementById(elementId)
	  , parentOffset = element.getBoundingClientRect()
	  , that = this;

	makeObservable(this);

	window.addEventListener("mousedown", function (e) {
		that.fire("mousedown", { 
			x: e.pageX - parentOffset.left,
			y: e.pageY - parentOffset.top
		});
    });

	window.addEventListener("mouseup", function (e) {
    	that.fire("mouseup",  { 
    		position: [e.pageX - parentOffset.left, e.pageY - parentOffset.top],
			x: e.pageX - parentOffset.left,
			y: e.pageY - parentOffset.top
		});
    });

	window.addEventListener("mousemove", function (e) {
    	that.fire("mousemove",  { 
			x: e.pageX - parentOffset.left,
			y: e.pageY - parentOffset.top
		});
    });
};

var KeyboardEventSource = function () {
	makeObservable(this);
	var that = this,
		isDown = {}, // remember which is key is down
		keyCode = {}; // defined below
	window.document.addEventListener("keydown", function(e) {
		isDown[e.keyCode] = true;
  		that.fire("keydown", { 
  			keyCode: e.keyCode,
  			keyLabel: keyCode[e.keyCode]
  		});
	}, false);

	window.document.addEventListener("keyup", function(e) {
		isDown[e.keyCode] = false;
  		that.fire("keyup", { 
  			keyCode: e.keyCode,
  			keyLabel: keyCode[e.keyCode]
  		});
	}, false);

	keyCode = { 
		'8': 'BACKSPACE',
		'9': 'TAB',
		'13': 'ENTER',
		'16': 'SHIFT',
		'17': 'CTRL',
		'18': 'ALT',
		'19': 'PAUSE',
		'20': 'CAPS_LOCK',
		'27': 'ESC',
		'32': 'SPACE',
		'33': 'PAGE_UP',
		'34': 'PAGE_DOWN',
		'35': 'END',
		'36': 'HOME',
		'37': 'LEFT_ARROW',
		'38': 'UP_ARROW',
		'39': 'RIGHT_ARROW',
		'40': 'DOWN_ARROW',
		'45': 'INSERT',
		'46': 'DELETE',
		'48': 'ZERO',
		'49': 'ONE',
		'50': 'TWO',
		'51': 'THREE',
		'52': 'FOUR',
		'53': 'FIVE',
		'54': 'SIX',
		'55': 'SEVEN',
		'56': 'EIGHT',
		'57': 'NINE',
		'65': 'A',
		'66': 'B',
		'67': 'C',
		'68': 'D',
		'69': 'E',
		'70': 'F',
		'71': 'G',
		'72': 'H',
		'73': 'I',
		'74': 'J',
		'75': 'K',
		'76': 'L',
		'77': 'M',
		'78': 'N',
		'79': 'O',
		'80': 'P',
		'81': 'Q',
		'82': 'R',
		'83': 'S',
		'84': 'T',
		'85': 'U',
		'86': 'V',
		'87': 'W',
		'88': 'X',
		'89': 'Y',
		'90': 'Z',
		'112': 'F1',
		'113': 'F2',
		'114': 'F3',
		'115': 'F4',
		'116': 'F5',
		'117': 'F6',
		'118': 'F7',
		'119': 'F8',
		'120': 'F9',
		'121': 'F10',
		'122': 'F11',
		'123': 'F12',
		'144': 'NUM_LOCK',
		'145': 'SCROLL_LOCK',
		'186': 'SEMI_COLON',
		'187': 'EQUALS',
		'188': 'COMMA',
		'189': 'DASH',
		'190': 'PERIOD',
		'191': 'FORWARD_SLASH',
		'192': 'GRAVE_ACCENT',
		'219': 'OPEN_SQUARE_BRACKET',
		'220': 'BACK_SLASH',
		'221': 'CLOSE_SQUARE_BRACKET',
		'222': 'SINGLE_QUOTE'
	};
};

// =============================================================================
//  
// =============================================================================
var Stage = function (containerId) {
	var container = window.document.getElementById(containerId);
	var canvas = window.document.createElement("canvas");
	container.appendChild(canvas);
	canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
	var ctx = canvas.getContext('2d');
	this.width = container.offsetWidth;
    this.height = container.offsetHeight;

	this.resize = function () {
		canvas.width = container.offsetWidth;
    	canvas.height = container.offsetHeight;
    	this.width = container.offsetWidth;
    	this.height = container.offsetHeight;
	};

    this.pixel = function(position) {
	    ctx.fillStyle = '#ffffff';
	    ctx.fillRect(position[0], position[1], 1, 1);
	};
	
	this.rect = function(position, size, color) {
	    ctx.fillStyle = color || '#000';
	    ctx.fillRect(position[0], position[1], size[0], size[1]);
	};

	this.path = function(vertices, w, color) {
		if(vertices.length > 0) {

			// todo: if we have a constant path, 
			// i.e. the vertices are all equal, nothing is printed

			ctx.beginPath();
			ctx.lineWidth = w;
			ctx.strokeStyle= color;
			ctx.moveTo(vertices[0][0],vertices[0][1]);

			for(var i = 1, max = vertices.length; i < max; i++) {
				ctx.lineTo(vertices[i][0],vertices[i][1]);
			}

			ctx.stroke(); 
		}
	};

	this.clear = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

};
// =============================================================================
//  
// =============================================================================
var Camera = function (config, stage) {
	console.log("New Camera...")
	var position = config.position;
	var viewport = config.viewport;
	var scale = Math.abs(stage.width/(viewport.upperright[0] - viewport.lowerleft[0]));

	this.toCanvas = function (worldPos) {
		var y = stage.height - scale*(worldPos[0] - position[0]),
			x = scale*(worldPos[1] - position[1]);
		return [x,y];
	};
	this.toWorld = function (canvasPos) {
		var y = ((stage.height - canvasPos[1])/scale) + position[0];
			x = (canvasPos[0]/scale) + position[1];
		return [y, x];
	};
	this.inViewport = function (obj) {
		// ...		
	};
};
// =============================================================================
//  
// =============================================================================
var Renderer = function (stage, camera) {
	console.log("New Renderer...")
	var stage = stage;
	var camera = camera;
	var toCanvas = camera.toCanvas;

	this.clear = function () {
		stage.clear();
	};
	this.drawEntity = function (entity) {
		var position = toCanvas(entity.position),
			size = entity.size,
			color = entity.color;
		if(!(position || size || color)) 
			throw entity + " is missing one of the following props: pos, size, color.";
		stage.rect(position, size, color);
	};

	this.drawSegment = function (seg) {
		stage.line(toCanvas(seg[0].position), toCanvas(seg[1].position), "#000");
	};
	this.drawNode = function (position, size, color) {
		var p = toCanvas(position)
		stage.rect([p[0] - size[0]/2, p[1]-size[1]/2], size, color) ;
	};
	this.drawPath = function (path) {
		var path = path.slice(),
			prev = path.shift(),
			that = this;

		this.drawNode(prev, [4,4], "rgb(255,0,0)");
		path.forEach(function (vertex) {
			stage.line(toCanvas(prev), toCanvas(vertex), "rgb(255,0,0)");
			that.drawNode(vertex, [4,4], "rgb(255,0,0)");
			prev = vertex;
		});
	};
};

// =============================================================================
//  
// =============================================================================
// 
// =============================================================================
//  
// =============================================================================
// 
// =============================================================================
//  
// =============================================================================
// 
// =============================================================================
//  
// =============================================================================
