brd.cal.num = (function() {
	var configMap = {
		dateFormat: 'DD-MM-YYYY'
	},
	stateMap = {
		$calendar: undefined
	},
	jqueryMap, initModule, setJqueryMap,
	increment, decrement;

	setJqueryMap = function() {
		var $calendar = stateMap.$calendar;
		jqueryMap = {
			$calendar: $calendar,
			$days: $calendar.find('.fc-day')
		}
	};

	//Appending an extra element to the day td causes it's styling to change and for the bar to go to 0 height... dunno why.
	/*increment = function(date) {
		var num, $p;

		if (stateMap[date]) {
			$p = stateMap[date].find('.brd-cal-num');
			num = +$p.text();
			$p.text(num + 1);
		} else {
			$p = jqueryMap.$calendar.find('.fc-day[data-date="' + moment(date, configMap.dateFormat).format('YYYY-MM-DD') + '"]');
			if (!$p || $p.length === 0) {
				return false;
			}
			$p.append('<div class="brd-cal-num">1</div>');
			stateMap[date] = $p;
		}
	};

	decrement = function(date) {
		var num, $p;

		if (stateMap[date]) {
			$p = stateMap[date].find('.brd-cal-num');
			num = +$p.text();
			if (num > 1) {
				$p.text(num - 1);
			} else {
				$p.text('');
			}
			
		} else {
			return false;
		}
	};*/

	//Attempt #2 -- Add a single event to the day and update the text in the event whenever another transaction is added. 
	//Style it to be tiny and minimal.



	//ADD A COUNT OF TRANSACTIONS TO EACH DAY TD.
	//Adding fullCalendar events causes the days to get crowded.
	//This relates to the general philosophy of what I'm making--
	//The individual transactions are unimportant.
	//It's the amount of $$ you spend.
	initModule = function($calendar) {
		stateMap.$calendar = $calendar;
		setJqueryMap();
	};

	return {
		initModule: initModule,
		increment: increment,
		decrement: decrement
	};
	
}());