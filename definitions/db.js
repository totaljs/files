require('dbms').init('textdb', ERROR('DBMS'));

ON('ready', function() {
	EXEC('-Settings --> load', ERROR('Settings.load'));
});