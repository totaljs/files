NEWSCHEMA('Files', function(schema) {

	schema.define('name', 'String(50)', true);
	schema.define('path', 'String(200)', true);
	schema.define('isshared', 'Boolean');

	schema.setQuery(function($) {

		var path = $.filter.path || '/';

		DBMS().all('files').data(function(response) {
			// Return only files and directories with correct path
			$.callback(response.filter(m => m.path === path));
		});

	}, 'path:String');

	schema.setUpdate(async function($, model) {
		model.dtupdated = NOW;

		var db = DBMS();
		var files = await db.all('files').fields('id,name,path,isdirectory').callback($);
		var path = FUNC.path_get(files, model.path, model.name);

		switch (path.status) {
			case 1:
				db.modify('files', model).id($.id).error(404).callback($.done());
				break;

			case 2:
				$.invalid('Name is already used');
				break;

			default:
				$.invalid('Path is invalid');
				break;

		}

	});

	schema.setRemove(function($) {
		// NOTE: File or directory will be removed from database but now frome filestorage! -> '/databases/fs-files'
		DBMS().remove('files').id($.id).error(404).callback($.done());
	});

	schema.addWorkflow('directory', function($, model) {
		model.isdirectory = true;
		model.ext = undefined;
		EXEC('+Files/Upload --> exec', model, $.callback);
	});

});
