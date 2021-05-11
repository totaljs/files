// Return absolute path of user from userid + add 'path'
FUNC.path = function(userid, path) {
	return CONF.path[0] === '~' ? PATH.join(CONF.path, userid, path) : PATH.root(PATH.join(CONF.path, userid, path));
};

// Check if path is valid
FUNC.valid = function(path) {
	return !(/\.\/|\.\./).test(path);
};

// Throw error if path is invalid
FUNC.invalid = function($, path) {
	if (!FUNC.valid(path))
		$.invalid(400);
};

// Prepare file to be sended
FUNC.file_details = function($, path_rel, callback) {
	var path = path_rel;
	var arr = path.split('/');

	// Detail object
	var obj = {};
	obj.ua = $.ua;
	obj.ip = $.ip;
	obj.token = U.encrypt_data($.user.id, CONF.secret_download, 'hex');
	obj.isdirectory = arr[arr.length - 2] === '/';
	obj.name = arr[arr.length - 2];
	obj.userid = $.user.id;
	obj.path = path;

	// Attach download url (only for files)
	if (!obj.isdirectory)
		obj.url = CONF.url + '/download/?path=' + encodeURIComponent(obj.path) + '&token=' + obj.token;

	// Get details
	PATH.fs.lstat(FUNC.path(obj.userid, path_rel), function(err, stats) {

		if (stats) {
			obj.isdirectory = stats.isDirectory();
			obj.size = stats.size;
			obj.dtupdated = stats.mtime;
			obj.dtcreated = stats.ctime;
		}

		// Response
		callback(obj);

	});

};