brd.bar = (function() {
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
			currentPercent: undefined
		},
		expenses: undefined,
		income: undefined,
		totalBarPercent: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap, add,
	addIncome, setIncome, getIncome, addExpenses, setExpenses, getExpenses, setSalary, getSalary,
	updateBar, getNextDiv, getPrevDiv, fillCurrentDiv,
	convertDateValueToString, buildDataDateStrings, appendDivsToDays, initializeBar,
	setDaysInMonth, add, loadInitialData, setupStateMap, subtractExpense, subtractIncome, subtract, set;

	set = function(newExpenses, newIncome, type) {
		//calculate percentages and then subtract to get the difference.
		stateMap.expenses = newExpenses;
		stateMap.income = newIncome;

		if (type === 'set') {
			updateBar(0);
		} else if (type === 'update') {
			updateBar(configMap.barSpeed);
		}

	}

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
		var lastDayOfMonth = stateMap.$calendar.fullCalendar('getDate').clone().endOf('month').date();

		if (stateMap.bar.currentDay > lastDayOfMonth) {
			return false;
		}
		stateMap.bar.currentBar.removeClass(configMap.currentBarClass);
		stateMap.bar.currentDay++;
		stateMap.bar.currentPercent = 0;
		stateMap.bar.currentBar = $('#brd-bar-' + stateMap.bar.currentDay);
		stateMap.bar.currentBar.addClass(configMap.currentBarClass);
		return stateMap.bar.currentBar;
	};

	getPrevDiv = function() {
		if (stateMap.bar.currentDay < 1) {
			return false;
		}
		stateMap.bar.currentBar.removeClass(configMap.currentBarClass);
		stateMap.bar.currentDay--;
		stateMap.bar.currentPercent = 100;
		stateMap.bar.currentBar = $('#brd-bar-' + stateMap.bar.currentDay);
		stateMap.bar.currentBar.addClass(configMap.currentBarClass);
		return stateMap.bar.currentBar;
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

	
	buildDataDateStrings = function() {
		var currentMoment, currentMonth, currentYear, monthString,
		nextMonth, nextMonthYear, nextMonthString, nextMonthMoment,
		prevMonthMoment, prevMonth, prevMonthYear, prevMonthString, yearMonthString;
		function convertMonthToString(month) {
			if (month < 10) return '0' + month;
			else return '' + month;
		}
		currentMoment = stateMap.$calendar.fullCalendar('getDate');
		nextMonthMoment = currentMoment.clone().add(1, 'month');
		prevMonthMoment = currentMoment.clone().subtract(1, 'month');
		currentMonth = currentMoment.month() + 1;
		currentYear = currentMoment.year();
		nextMonth = nextMonthMoment.month() + 1;
		nextMonthYear = nextMonthMoment.year();
		prevMonth = prevMonthMoment.month() + 1;
		prevMonthYear = prevMonthMoment.year(); 
		monthString = convertMonthToString(currentMonth);
		nextMonthString = convertMonthToString(nextMonth);
		prevMonthString = convertMonthToString(prevMonth);
		
		yearMonthString = currentYear + '-' + monthString;
		stateMap.dateStrings.monthString = monthString;
		stateMap.dateStrings.yearMonthString = yearMonthString;
		stateMap.dateStrings.nextYearMonthString = nextMonthYear + '-' + nextMonthString;
		stateMap.dateStrings.prevYearMonthString = prevMonthYear + '-'+ prevMonthString;
		stateMap.dateStrings.firstDayString = yearMonthString + '-01';
		stateMap.dateStrings.nextMonthFirstDayString = stateMap.dateStrings.nextYearMonthString + '-01';
	};
		
	setJqueryMap = function() {
		var $calendar = stateMap.$calendar,
		$weeks = $calendar.find('.fc-week');
		jqueryMap = {
			$calendar: $calendar,
			$days: $calendar.find('.fc-day'),
			$weeks: $weeks,
			$firstWeek: $weeks.first().find('.fc-day'),
			$lastWeek: $weeks.last().find('.fc-day'),
			$firstDay: $calendar.find('.fc-day[data-date="' + stateMap.dateStrings.firstDayString + '"]'),
			$firstDayOfNextMonth: $calendar.find('.fc-day[data-date="' + stateMap.dateStrings.nextMonthFirstDayString + '"]')
		}
	};

	appendDivsToDays = function() {
		var numberOfDaysInMonth = stateMap.$calendar.fullCalendar('getDate').clone().endOf('month').date(),
		dayString, dateString;
		for (var i = 1; i <= numberOfDaysInMonth; i++) {
			dayString = convertDateValueToString(i);
			dateString = stateMap.dateStrings.yearMonthString + '-' + dayString;
			$('td[data-date="' + dateString + '"]').append('<div class="brd-bar" id="brd-bar-' + i + '"></div>');
		}
	};

	initializeBar = function() {
		stateMap.bar.currentDay = 1;
		stateMap.bar.currentPercent = 0;
		stateMap.bar.currentBar = $('#brd-bar-' + stateMap.bar.currentDay);
		stateMap.bar.currentBar.addClass('brd-bar-1 brd-bar-current')
	};

	loadInitialData = function(data) {
		if (!data)
			return false;
		setDaysInMonth(data.endOfMonth);
		set(data.expenses, data.income, 'set');
		return true;
	};

	setupStateMap = function() {
		stateMap.$calendar = undefined;
		stateMap.dateStrings = {};
		stateMap.expenses = 0;
		stateMap.income = 0;
		stateMap.totalBarPercent = 0;
		configMap.daysInMonth = undefined;
	};
	
	initModule = function($calendar, data) {
		setupStateMap();
		stateMap.$calendar = $calendar;
		buildDataDateStrings();
		setJqueryMap();
		appendDivsToDays();
		initializeBar();
		loadInitialData(data);
	};

	return {
		initModule: initModule,
		set: set
	};

}());