var express = require('express'), 
	app = express(), 
	port = process.env.PORT || 3000,
	server = app.listen(port),
	io = require('socket.io').listen(server);


var Event = (function (defaultEffects) {
	var defaultEffects = defaultEffects;

	return function (type, id, virtual) {
		this.type = type;
		this.id = id;
		this.virtual = virtual;
		var effects = [defaultEffects[this.type]] || [];
		this.execute = function (state, queue) {
			effects.forEach(function (effect) {
				effect(state, queue)
			})
		};

	};

}({
	"none": function (state, queue) {
		console.log("test log");
	}
}));


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendfile("./public/index.html");
});


var e = new Event("none", 0, false);

io.sockets.on('connection', function (socket) {



		socket.emit("welcome", {
			"msg": "You're connected with socket-id:  " + socket.id,
			"id": socket.id,
			"event": e
		});


		socket.on('disconnect', function () {
			console.log('Disconnect: ' + socket.id);
			socket.broadcast.emit('player left', { 
				msg: socket.id + " left..."
			});
	    });

	    // ----------
		// 
		// ----------

	});