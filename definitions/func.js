FUNC.path_get = function(files, path, name) {
	// files - [{ id: UID, name: string, path: string }]

	// response.status:
	// 0 - Invalid (Path doesnt exist)
	// 1 - Valid
	// 2 - File exist

	var response = { status: 1, file: null };

	if (!files.length && path === '/')
		return response;

	for (var i = 0; i < files.length; i++) {
		var file = files[i];

		// Taken
		if (file.path === path && file.name === name) {
			response.status = 2;
			response.file = file;
			return response;
		}

		// Find folder from path
		if (file.path + (file.path !== '/' ? '/' : '') + file.name === path && file.isdirectory) {
			response.status = 1;
			response.file = file;
			return response;
		}

	}

	if (path === '/')
		response.status = 1;
	else
		response.status = 0;

	return response;

}