NEWSCHEMA('Files/Move', function(schema) {

	schema.define('from', 'String(200)', true);
	schema.define('to', 'String(200)', true);

	schema.addWorkflow('exec', function($, model) {

		model.to = U.path(model.to);

		// Path validation
		if (FUNC.invalid(from) || FUNC.invalid(model.to))
			return;

		var from = FUNC.path($.user.id, model.from);
		var to = FUNC.path($.user.id, model.to);
		var fs = PATH.fs;

		// Get filename from path
		var filename = from.split('/').splice(-1, 1).join();

		// Create directory (if doesnt exists yet)
		fs.mkdir(to, { recursive: true }, $.successful(function() {
			// Move file
			fs.rename(from, to + filename, $.successful(function() {
				FUNC.file_details($, model.to + filename, function(file) {

					file.from = model.from;
					file.to = model.to;

					// Log
					$.audit(model.to + filename);

					// TMS
					PUBLISH('file_move', file);

					// Response
					$.callback(model);

				});
			}));
		}));

	});

});