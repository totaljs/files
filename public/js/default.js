FUNC.path = function() {
	var builder = [];
	for (var i = 0; i < arguments.length; i++) {
		var path = arguments[i];
		builder.push(path.trim().replace(/^\/|\/$/g, ''));
	}
	return '/' + builder.join('/');
};