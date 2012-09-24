var Skual = {
	'config': {
		'baseUrl': '/api/v1', // WITHOUT the trailing slash!
		'database': {
			// Database configurations.
			// Can be selected in the front end if not defined here.
			// username & password CAN NOT be defined from here
			'engine': 'mysql',
		    'hostname': '127.0.0.1',
		    'port': 3306
		},
		'history': 10,      // Number of query kept in the local storage history
		'lang': 'en',       // For future use
	}
}