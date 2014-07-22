

// define(function () {
	var helper = {};

	helper.bind = function (that, f) {
		return function (_) {
			return f.apply(that, arguments);
		};
	};

	helper.partial = function (f, x) {
		return function (_) {
			var args = [].slice.call(arguments); 
			return f.apply(this, [x].concat(args));
		};
	};


	// return helper;
	module.exports = helper;
// });