AUTH(function($) {
	// Here you can implement your custom authorization.
	// User's id is used as his root folder so make sure its always unique for each user.
	$.success({ id: 'admin', name: 'Admin', sa: true });
});