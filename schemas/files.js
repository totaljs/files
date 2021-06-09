NEWSCHEMA('Files', function(schema) {

	schema.define('path', 'String(200)', true);

	// Listing of directories and files
	schema.setQuery(function($) {

		var original = U.path($.filter.path) || '/';

		// Path validation
		if (FUNC.invalid($, original))
			return;

		var fs = PATH.fs;
		var path = FUNC.path($.user.id, U.path(original));

		fs.readdir(path, { withFileTypes: true }, function(err, response) {

			var output = [];

			if (response) {
				response.wait(function(item, next) {
					var obj = {};
					obj.name = item.name;
					obj.path = original + obj.name;
					obj.isdirectory = item.isDirectory();

					// Get details
					fs.stat(path + obj.name, function(err, stats) {

						if (stats) {
							obj.size = stats.size;
							obj.dtcreated = stats.ctime;
							obj.dtupdated = stats.mtime;
						}

						output.push(obj);
						next();
					});

				}, function() {
					// Response
					output.quicksort('isdirectory_desc,name_asc');
					$.callback(output);
				});

			} else
				$.callback(output);

		});

	}, 'path:String');

	// Remove file or directory
	schema.setRemove(function($, model) {
		var path = U.path(model.path) || '/';

		// Can't remove root
		if (path === '/') {
			$.invalid(400);
			return;
		}

		// Path validation
		if (FUNC.invalid($, path))
			return;

		$.audit(path);

		// Read stats before removing file/directory
		FUNC.file_details($, path, function(file) {

			// TMS
			PUBLISH('file_remove', file);
			$.success();

			path = FUNC.path($.user.id, path);

			if (file.isdirectory)
				PATH.fs.rmdir(path, { recursive: true }, $.done());
			else
				PATH.fs.unlink(path.substring(0, path.lastIndexOf('/')), $.done());

		});

	});

	// Create empty directory
	schema.addWorkflow('directory', function($, model) {
		var fs = PATH.fs;
		var path = FUNC.path($.user.id, U.path(model.path));

		// Path validation
		if (FUNC.invalid($, path))
			return;

		$.audit();

		// Create directory (if not exist)
		if (fs.stat(path, function(err) {

			if (err) {
				fs.mkdir(path, { recursive: true }, function() {
					// TMS
					FUNC.file_details($, path, function(file) {
						file.isdirectory = true;
						PUBLISH('directory_create', file);
					});
				});
			}

			$.success();
		}));

	});

	// Helper for recursive search
	function find(name, phrase) {
		return name.toSearch().indexOf(phrase.toSearch()) !== -1;
	}

	// Recursive search
	function search(phrase, path_rel, path_abs, output, callback) {
		PATH.fs.readdir(path_abs, { withFileTypes: true }, function(err, files) {
			files.wait(function(file, next) {

				// Limit
				if (output.length >= 50) {
					next();
					return;
				}

				var obj = {};
				obj.name = file.name;
				obj.isdirectory = file.isDirectory();
				obj.path = path_rel + '/' + file.name;

				if (obj.isdirectory) {
					search(phrase, path_rel + '/' + obj.name, path_abs + '/' + file.name, output, next);
					find(obj.name, phrase) && output.push(obj);
				} else {
					find(obj.name, phrase) && output.push(obj);
					next();
				}

			}, function() {
				callback();
			});
		});
	}

	// Search user's directories and files (recursive)
	schema.addWorkflow('search', function($) {

		var files = [];
		var q = $.filter.q;

		// Empty search field
		if (!q.length) {
			$.callback(files);
			return;
		}

		// Prepare paths
		var path_abs = FUNC.path($.user.id, '/');
		var path_rel = path_abs.substring(path_abs.indexOf($.user.id) + $.user.id.length + 1);

		// Recursively search user's data
		search(q, path_rel, path_abs, files, function() {
			$.callback(files);
		});

	}, 'q:String');

	// Generate share link
	schema.addWorkflow('share', function($, model) {

		var path = model.path;

		// Path validation
		if (FUNC.invalid($, path))
			return;

		$.audit(path);

		FUNC.file_details($, path, function(file) {
			$.success(file.url);
		});

	});

});