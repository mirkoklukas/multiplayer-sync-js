// =============================================================================
//  Some stuff.
// =============================================================================
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
// =============================================================================
//  
// =============================================================================
// =============================================================================
//  
// =============================================================================
// =============================================================================
//  
// =============================================================================
