// =============================================================================
//  The Game State. It consists of entitities that populate the world...
// =============================================================================
var update = function (obj, changes) {
	for (key in changes) {
		if (typeof obj[key] !== "object")
			obj[key] = changes[key]
		else
			update(obj[key], changes[key]);
	}
};