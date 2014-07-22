var h = require("./helper.js");


var p = h.partial;


var add = function () {
	var args = [].slice.call(arguments);
	return args.reduce(function (a, b) {
		return a+b;
	});
};

var add1 = p(add, 1);


console.log(add1());
console.log(add1(2));