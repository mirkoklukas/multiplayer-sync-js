
// ==================================================
//  
// ==================================================

var c;


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

var stage = new Stage("canvas-container");

var drawQueue = function (queue, t) {
	var alpha = 20/1000;
	stage.clear();

	stage.rect([stage.width/2,0], [1,100], "rgb(0,0,0)");
	var x,
		lastX,
		y=0;
	queue.history.forEach(function (te) {
		x = alpha*(te[0] - t) + stage.width/2;
		if( x === lastX) y+=21;
		else y=0;
		lastX = x;
		stage.rect([x,y], [5,20], "rgb(0,255,0)");
	});
	queue.events.forEach(function (te) {
		x = alpha*(te[0] - t) + stage.width/2;
		if( x === lastX) y+=21;
		else y=0;
		lastX = x;
		stage.rect([x,y], [5,20], "rgb(255,0,0)");
	});
};


var placeBomb = new Event("Bomb placed")
					.chain(new Event("Explosion"), 2000)
					.chain(new Event("DeadZone"), 0);

var q = new EventQueue();

q.push(placeBomb, add(2000));



//q.shift().execute({},q);

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

var time = +new Date();
var delta = 100;

var fix = function (c) {
	return function() {return c;};
};

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 13) {
  	time += delta;
  }
}, false);


var infty = new AnimationFrameLoop(function () {
	drawQueue(q, time);
	q.setTime(fix(time));
	var e = q.shift(delta);
	while (e) {
		e.execute({},q);
		e = q.shift(delta);
	};
		
});

