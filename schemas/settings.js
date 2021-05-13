NEWSCHEMA('Settings', function(schema) {

	schema.define('url', String, true);
	schema.define('allow_tms', Boolean);
	schema.define('allow_totalapilogger', Boolean);
	schema.define('secret_tms', String);
	schema.define('secret_download', String, true);
	schema.define('totalapi', String);

	schema.setRead(function($) {

		if (UNAUTHORIZED($))
			return;

		$.callback(PREF.settings || EMPTYOBJECT);

	});

	schema.setSave(function($, model) {

		if (UNAUTHORIZED($))
			return;

		model.dtupdated = NOW;
		$.audit();
		PREF.set('settings', model);
		$.success();

	});

	schema.addWorkflow('load', function($) {

		var settings = PREF.settings || EMPTYOBJECT;
		for (var key in settings)
			CONF[key] = settings[key];

		CMD('refresh_tms');
		$.success();

	});

});