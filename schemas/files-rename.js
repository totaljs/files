NEWSCHEMA('Files/Rename', function(schema) {

	schema.define('from', 'String(200)', true); // Path of file to rename
	schema.define('name', 'String(50)', true); // New file name

	schema.addWorkflow('exec', function($, model) {
		if (FUNC.invalid(model.from))
			return;

		FUNC.file_details($, model.from, function(file) {

			file.from = model.from;
			file.name = model.name;

			// TMS
			PUBLISH('file_rename', file);

			model.from = FUNC.path($.user.id, model.from);
			var to = PATH.join(model.from.split('/').slice(0, -1).join('/'), model.name);

			// Rename
			PATH.fs.rename(model.from, to, function(err) {
				if (err)
					$.invalid('Invalid operation');
				else {
					// Log
					$.audit(model.from);

					// Response
					$.callback(file);
				}
			});

		});
	});

});