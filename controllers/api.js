exports.install = function() {

	ROUTE('GET       /files/                 *Files --> query');
	ROUTE('POST      /files/                 *Files --> insert');
	ROUTE('PUT       /files/{id}/            *Files --> update');
	ROUTE('DELETE    /files/                 *Files --> remove');
	ROUTE('POST      /files/directory/       *Files --> directory');

	// Download & Upload
	ROUTE('FILE      /files/*.*', download);
	ROUTE('POST      /files/upload/', upload, ['upload'], 1024 * 2); // 2 MB max.
};

function upload() {

	var self = this;
	var output = [];
	var path = self.body.path || '/';

	self.files.wait(function(file, next) {

		var obj = {};
		obj.fileid = UID();
		obj.name = file.filename.substring(0, file.filename.lastIndexOf('.'));
		obj.ext = file.filename.split('.').pop();
		obj.size = file.size;
		obj.type = file.type;
		obj.path = path;
		obj.isdirectory = false;

		// Save file to filestorage under 'files'
		file.fs('files', obj.fileid, function(err) {
			if (err) {
				self.invalid(err);
			} else {
				// Manualy execute method 'setInsert' from schema 'Files' with data validation (+)
				EXEC('+Files/Upload --> file', obj, self.successful(function(response) {
					output.push(response);
					next();
				}));
			}
		});

	}, () => self.json(output));

}

function download(req, res) {
	var filename = req.split[1];
	var id = filename.substring(0, filename.lastIndexOf('.'));
	res.filefs('files', id, true);
}