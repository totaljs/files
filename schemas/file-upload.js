NEWSCHEMA('Files/Upload', function(schema) {

	schema.define('fileid', 'UID');
	schema.define('path', 'String(200)', true);
	schema.define('name', 'String(50)', true);
	schema.define('ext', 'String(15)');
	schema.define('type', 'String(20)');
	schema.define('size', 'Number');
	schema.define('isdirectory', 'Boolean');
	schema.define('isshared', 'Boolean');

	function file(model) {
		model.url = '/files/' + model.fileid + '.' + model.ext;
	}

	schema.addWorkflow('exec', async function($, model) {

		var db = DBMS();

		// Find all relevant files and directories
		var files = await db.all('files').fields('id,name,path,isdirectory').callback($);

		// Helpers
		var insert = function() {
			model.id = UID();
			model.dtcreated = NOW;

			if (!model.isdirectory && model.fileid)
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

		// Creating in root
		if (model.path === '/') {
			var duplicate = files.find(f => f.path === '/' && f.name === model.name);
			if (duplicate)
				rewrite(duplicate.id);
			else
				insert();
			return;
		}

		// Creating in directory
		var path = FUNC.path_get(files, model.path, model.name);

		switch (path.status) {
			case 1:
				insert();
				break;

			case 2:
				rewrite(path.file.id);
				break;

			default:
				$.invalid(400, 'Path is invalid'); // Wrong path (one or more directories doesn't exists)
				break;

		}
	});

})