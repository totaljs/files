NEWSCHEMA('Files/Upload', function(schema) {

	schema.define('fileid', 'UID');
	schema.define('path', 'String(200)', true);
	schema.define('ext', 'String(15)');
	schema.define('type', 'String(20)');
	schema.define('size', 'Number');
	schema.define('isshared', 'Boolean');

	function file(model) {
		model.url = '/files/' + model.fileid + '.' + model.ext;
	}

	schema.addWorkflow('directory', async function($, model) {

		var db = DBMS();
		var full = model.path;
		var name = full.split('/').splice(-2, 1).join();
		var path = full.substring(0, full.lastIndexOf(name));

		model.name = name;
		model.isdirectory = true;
		model.fileid = undefined;

		// Find all relevant files and directories from database
		var files = await db.all('files').fields('id,name,path,isdirectory').in('path', [path, full]).callback($);

		// Helper
		var insert = function() {
			model.id = UID();
			model.dtcreated = NOW;
			db.insert('files', model).callback($.done());
		};

		// Root
		if (path === '/' && !files.length) {
			insert();
			return;
		}

		var message = 'Path is invalid.';
		for (var i = 0; i < files.length; i++) {
			var file = files[i];

			// Directory duplicate
			if (file.path === full && file.isdirectory) {
				message = 'Directory with that name already exists.';
				break;
			}

			// File duplicate
			if (file.path === full && file.name === name && !file.isdirectory) {
				message = 'There is already file with that name.';
				break;
			}

			// Path exists
			if (file.path === path && file.isdirectory)
				message = null;

		}

		// Create
		if (message === null)
			insert();
		else
			$.invalid(message);

	});

	schema.addWorkflow('file', async function($, model) {

		var db = DBMS();
		var original = model.path;
		var name = original.substring(original.lastIndexOf('/') + 1);
		var path = original.substring(0, original.lastIndexOf('/') + 1);

		model.name = name;
		model.isdirectory = false;

		// Find all relevant files and directories
		var paths = [];
		paths.push(original);
		paths.push(path);
		console.log('paths', paths);
		var files = await db.all('files').fields('id,name,path,isdirectory').in('path', paths).callback($);


		// Helpers
		var insert = function() {
			model.id = UID();
			model.dtcreated = NOW;

			if (model.isdirectory && model.fileid)
				file(model);

			db.insert('files', model).callback($.done(model.url));
		};

		var rewrite = function(id) {
			// NOTE: Rewrite will upload another file into filestorage so old upload is still there but not linked
			if (model.isdirectory) {
				$.invalid(400, 'Directory already exists');
			} else {
				file(model);
				db.modify('files', model).id(id).callback($.done(model.url));
			}
		};

		// Root
		if (path === '/' && !files.length) {
			insert();
			return;
		}

		var message = 'Path is invalid.';
		for (var i = 0; i < files.length; i++) {
			var file = files[i];

			// File duplicate
			if (file.path === original) {
				if ($.filter.overwrite)
					message = 'There is already file with that name.';
				else

					break;
			}

			// Path exists
			if (file.path === path && file.isdirectory)
				message = null;

		}

		// Create;
		if (message === null)
			insert();
		else
			$.invalid(message);

	});

})