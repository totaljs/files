NEWSCHEMA('Settings/TotalAPI', function(schema) {

	schema.define('totalapi', 'String(100)', true);

	schema.addWorkflow('exec', function($, model) {
		if (UNAUTHORIZED($))
			return;
		TotalAPI(model.totalapi, 'check', EMPTYOBJECT, $.callback);
	});

});