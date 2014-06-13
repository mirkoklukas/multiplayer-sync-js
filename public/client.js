



var socket = io.connect('http://localhost:3000/');

socket.on('welcome', function (data) {
		console.log(data.msg);
		debugger

});

