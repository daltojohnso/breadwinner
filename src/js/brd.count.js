brd.count = (function() {
	var configMap = {},
	stateMap = {},
	jqueryMap, initModule, setJqueryMap;


	//ADD A COUNT OF TRANSACTIONS TO EACH DAY TD.
	//Adding fullCalendar events causes the days to get crowded.
	initModule = function($calendar) {
		stateMap.$calendar = $calendar;
		setJqueryMap();
	};

	return {
		initModule: initModule
	};
	
}());