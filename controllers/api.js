exports.install = function() {

	// Total.js API Routes
	ROUTE('+API       /api/                      -files               *Files          --> query');
	ROUTE('+API       /api/                      +files_rename        *Files/Rename   --> exec');
	ROUTE('+API       /api/                      +files_move          *Files/Move     --> exec');
	ROUTE('+API       /api/                      +files_remove        *Files          --> remove');
	ROUTE('+API       /api/                      -files_search        *Files          --> search');
	ROUTE('+API       /api/                      +files_link          *Files          --> share');

	ROUTE('+API       /api/                      +directory_create    *Files          --> directory');

	// Download & Upload
	ROUTE('GET        /download/', download);
	ROUTE('+POST      /api/upload/', upload, ['upload', 1000 * 60], 1024 * 100); // 100 MB max.

};

function upload() {

	var $ = this;
	var fs = PATH.fs;
	var path = U.path($.body.path) || '/';
	var dir = FUNC.path($.user.id, path);

	// Create directory (if not exists)
	fs.mkdir(dir, { recursive: true }, function() {
		// Move uploaded files to user's "storage"
		$.files.wait(function(file, next) {
			file.move(dir + file.filename, function() {
				FUNC.file_details($, path + file.filename, function(obj) {
					// TMS
					PUBLISH('file_insert', obj);

					// Proceed to next file
					next();
				});
			});
		}, () => $.success(path));
	});

}

function download() {
	var $ = this;
	var path = $.query.path || '/';

	var userid = null;

	// Auth - Token check
	var token = $.query.token || '';
	if (token.length)
		userid = token.decrypt(CONF.secret_download);

	// Auth - User check
	if ($.user)
		userid = $.user.id;

	// Auth - Invalid
	if (!userid) {
		$.invalid(401);
		return;
	}

	// Perform download
	if (FUNC.valid(path))
		$.file('~' + FUNC.path(userid, path), U.getName(path));
	else
		$.invalid(404);

}