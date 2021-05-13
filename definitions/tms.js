// Publish
NEWPUBLISH('file_insert', 'file_insert');
NEWPUBLISH('file_remove', 'file_remove');
NEWPUBLISH('file_move', 'file_move');
NEWPUBLISH('file_rename', 'file_rename');
NEWPUBLISH('directory_create', 'directory_create');

// Subscribe
NEWSUBSCRIBE('file_upload', 'file_upload');
NEWSUBSCRIBE('file_remove', 'file_remove');
NEWSUBSCRIBE('file_move', 'file_move');
NEWSUBSCRIBE('file_rename', 'file_rename');
NEWSUBSCRIBE('directory_create', 'directory_create');

SUBSCRIBE('directory_create', function(model) {
	EXEC('+Files --> directory', model, NOOP).user = { id: model.userid };
});

SUBSCRIBE('file_rename', function(model) {
	EXEC('+Files/Rename --> exec', model, NOOP).user = { id: model.userid };
});

SUBSCRIBE('file_move', function(model) {
	EXEC('+Files/Move --> exec', model, NOOP).user = { id: model.userid };
});

SUBSCRIBE('file_remove', function(model) {
	EXEC('+Files --> remove', model, NOOP).user = { id: model.userid };
});

SUBSCRIBE('file_upload', function(model) {
	// Download file from url and save to user's "stroage"
	var path = FUNC.path(model.userid, model.path);
	DOWNLOAD(model.url, path, function(err) {
		if (!err) {
			// TMS
			var $ = {};
			$.user = { id: model.userid };

			FUNC.file_details($, model.path, function(file) {
				PUBLISH('file_insert', file);
			});
		}
	});
});