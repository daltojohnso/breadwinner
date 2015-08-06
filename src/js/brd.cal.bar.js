brd.cal.bar = (function() {
	'use strict';
	var configMap = {
		barSpeed: 100,
		daysInMonth: undefined,
		currentBarClass: 'brd-bar-current',
		prevBarClass: 'brd-bar-prev',
		dayOneBarClass: 'brd-bar-one'
	},
	stateMap =  {
		$calendar: undefined,
		dateStrings: {},
		bar: {
			currentBar: undefined,
			currentDay: undefined,
			currentPercent: undefined,
			timeoutIds: []
		},
		expenses: undefined,
		income: undefined,
		totalBarPercent: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap,
	updateBar, getNextDiv, getPrevDiv, fillCurrentDiv,
	convertDateValueToString, buildYearMonthDateString, initializeBar,
	setDaysInMonth, loadInitialData, clearStateMap, set;

	set = function(newExpenses, newIncome, type) {
		stateMap.expenses = newExpenses;
		stateMap.income = newIncome;

		if (type === 'set') {
			updateBar(0);
		} else if (type === 'update') {
			updateBar(configMap.barSpeed);
		}
	};

	setDaysInMonth = function(daysInMonth) {
		configMap.daysInMonth = daysInMonth;
		return configMap.daysInMonth;
	};

	updateBar = function(barSpeed) {
		var totalBarPercent = stateMap.totalBarPercent,
		expenses = stateMap.expenses,
		income = stateMap.income,
		daysInMonth = configMap.daysInMonth,
		newPercent, difference;

		if (income) {
			newPercent = (expenses/(income/daysInMonth)) * 100;
			difference = newPercent - totalBarPercent;
			stateMap.totalBarPercent += difference;

			if (stateMap.totalBarPercent < 0) {
				stateMap.totalBarPercent = 0;
			} else if (stateMap.totalBarPercent > daysInMonth * 100) {
				stateMap.totalBarPercent = daysInMonth * 100;
			}

			fillCurrentDiv(difference, barSpeed);
		}
	};

	getNextDiv = function() {
		var lastDayOfMonth = stateMap.$calendar.fullCalendar('getDate').clone().endOf('month').date(),
			bar = stateMap.bar;

		if (bar.currentDay > lastDayOfMonth) {
			return false;
		}
		bar.currentBar.removeClass(configMap.currentBarClass);
		bar.currentDay++;
		bar.currentPercent = 0;
		bar.currentBar = $('.brd-bar-' + bar.currentMonth + '-' + convertDateValueToString(bar.currentDay));
		bar.currentBar.addClass(configMap.currentBarClass);
		return bar.currentBar;
	};

	getPrevDiv = function() {
		var bar = stateMap.bar;
		if (bar.currentDay < 1) {
			return false;
		}
		bar.currentBar.removeClass(configMap.currentBarClass);
		bar.currentDay--;
		bar.currentPercent = 100;
		bar.currentBar = $('.brd-bar-' + bar.currentMonth + '-' + convertDateValueToString(bar.currentDay));
		bar.currentBar.addClass(configMap.currentBarClass);
		return bar.currentBar;
	};

	fillCurrentDiv = function(addedPercent, barSpeed) {
		var currentBar = stateMap.bar.currentBar,
		currentPercent = stateMap.bar.currentPercent,
		newPercent, leftoverPercent;

		if (!currentBar || addedPercent === 0) return false;

		newPercent = currentPercent + addedPercent;
		if (newPercent > 0 && newPercent < 100) {
			currentBar.animate({width: newPercent + '%'}, barSpeed, 'linear');
			stateMap.bar.currentPercent = newPercent;
		} else {
			if (addedPercent > 0) {
				currentBar.animate({width: '100%'}, barSpeed, 'linear');
				leftoverPercent = newPercent - 100;
				currentBar = getNextDiv();
				if (currentBar) {
					setTimeout(function() { fillCurrentDiv(leftoverPercent, barSpeed); }, barSpeed);
				}
			} else {
				currentBar.animate({width: 0}, barSpeed, 'linear');
				currentBar = getPrevDiv();
				if (currentBar) {
					setTimeout(function() { fillCurrentDiv(newPercent, barSpeed); }, barSpeed);
				}
			}
		}
	};
	
	convertDateValueToString = function(val) {
		if (val < 10) return '0' + val;
		else return '' + val;
	};

	
	buildYearMonthDateString = function() {
		var currentMoment, currentMonth, currentYear, monthString, yearMonthString;

		function convertMonthToString(month) {
			if (month < 10) return '0' + month;
			else return '' + month;
		}

		currentMoment = stateMap.$calendar.fullCalendar('getDate');
		currentYear = currentMoment.year();
		currentMonth = currentMoment.month() + 1;
		monthString = convertMonthToString(currentMonth);
		yearMonthString = currentYear + '-' + monthString;
		stateMap.dateStrings.yearMonthString = yearMonthString;
		stateMap.dateStrings.currentMonthString = monthString;
	};
		
	setJqueryMap = function() {
		var $calendar = stateMap.$calendar,
		$weeks = $calendar.find('.fc-week');
		jqueryMap = {
			$calendar: $calendar,
			$days: $calendar.find('.fc-day'),
			$weeks: $weeks
		}
	};

	initializeBar = function() {
		var bar = stateMap.bar;
		bar.currentDay = 1;
		bar.currentMonth = stateMap.dateStrings.currentMonthString;
		bar.currentPercent = 0;
		bar.currentBar = $('.brd-bar-' + bar.currentMonth + '-01');
		bar.currentBar.addClass('brd-bar-1 brd-bar-current')
	};

	loadInitialData = function(data) {
		if (!data)
			return false;
		setDaysInMonth(data.endOfMonth);
		set(data.expenses, data.income, 'set');
		return true;
	};

	clearStateMap = function() {
		stateMap.$calendar = undefined;
		stateMap.dateStrings = {};
		stateMap.expenses = 0;
		stateMap.income = 0;
		stateMap.totalBarPercent = 0;
		configMap.daysInMonth = undefined;
	};
	
	initModule = function($calendar, data) {
		clearStateMap();
		stateMap.$calendar = $calendar;

		buildYearMonthDateString();
		setJqueryMap();
		initializeBar();
		loadInitialData(data);
	};

	return {
		initModule: initModule,
		set: set
	};

}());