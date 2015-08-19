brd.cal.bar = (function() {
	'use strict';
	var config = {
		barSpeed: 100,
		daysInMonth: undefined,
		currentBarClass: 'brd-bar-current',
		prevBarClass: 'brd-bar-prev',
		dayOneBarClass: 'brd-bar-one'
	},
	state = {
		$calendar: undefined,
		dateStrings: {},
		bar: {
			currentBar: undefined,
			currentDay: undefined,
			currentPercent: undefined,
			timeoutIds: []
		},
		numerator: undefined,
		denominator: undefined,
		totalBarPercent: undefined
	},
	initModule,
	updateBar, getNextDiv, getPrevDiv, fillCurrentDiv,
	convertDateValueToString, buildDateStrings, initializeBar, loadInitialData, clearState, set, moving;

	moving = function() {
		return state.bar.timeoutIds.length === 0 ? false : true;
	};

	set = function(numerator, denominator, type) {
		state.numerator = numerator;
		state.denominator = denominator;

		if (type === 'set') {
			updateBar(0);
		} else if (type === 'update') {
			updateBar(config.barSpeed);
		}
	};

	updateBar = function(barSpeed) {
		var totalBarPercent = state.totalBarPercent,
		numerator = state.numerator,
		denominator = state.denominator,
		daysInMonth = config.daysInMonth,
		newPercent, difference;

		if (denominator) {
			newPercent = (numerator/(denominator/daysInMonth)) * 100;
			difference = newPercent - totalBarPercent;
			state.totalBarPercent += difference;

			if (state.totalBarPercent < 0) {
				state.totalBarPercent = 0;
			} else if (state.totalBarPercent > daysInMonth * 100) {
				state.totalBarPercent = daysInMonth * 100;
			}

			fillCurrentDiv(difference, barSpeed);
		}
	};

	getNextDiv = function() {
		var lastDayOfMonth = brd.cal.getDate().endOf('month').date(),
			bar = state.bar,
			target;

		if (bar.currentDay > lastDayOfMonth) {
			return false;
		}
		bar.currentBar.removeClass(config.currentBarClass);
		bar.currentDay++;
		bar.currentPercent = 0;
		target = '.brd-bar-' + bar.currentMonth + '-' + convertDateValueToString(bar.currentDay);
		bar.currentBar = $(target);
		bar.currentBar.addClass(config.currentBarClass);
		return bar.currentBar;
	};

	getPrevDiv = function() {
		var bar = state.bar, target;
		if (bar.currentDay < 1) {
			return false;
		}
		bar.currentBar.removeClass(config.currentBarClass);
		bar.currentDay--;
		bar.currentPercent = 100;
		target = '.brd-bar-' + bar.currentMonth + '-' + convertDateValueToString(bar.currentDay);
		bar.currentBar = $(target);
		bar.currentBar.addClass(config.currentBarClass);
		return bar.currentBar;
	};

	fillCurrentDiv = function(addedPercent, barSpeed) {
		var currentBar = state.bar.currentBar,
		currentPercent = state.bar.currentPercent,
		newPercent, leftoverPercent;

		if (!currentBar || addedPercent === 0) return false;

		newPercent = currentPercent + addedPercent;
		if (newPercent > 0 && newPercent < 100) {
			currentBar.animate({width: newPercent + '%'}, barSpeed, 'linear');
			state.bar.currentPercent = newPercent;
		} else {
			if (addedPercent > 0) {
				currentBar.animate({width: '100%'}, barSpeed, 'linear');
				leftoverPercent = newPercent - 100;
				currentBar = getNextDiv();
				if (currentBar) {
					state.bar.timeoutIds.push(setTimeout(function() { fillCurrentDiv(leftoverPercent, barSpeed); }, barSpeed));
				}
			} else {
				currentBar.animate({width: 0}, barSpeed, 'linear');
				currentBar = getPrevDiv();
				if (currentBar) {
					state.bar.timeoutIds.push(setTimeout(function() { fillCurrentDiv(newPercent, barSpeed); }, barSpeed));
				}
			}
			setTimeout(function() {
				state.bar.timeoutIds.pop()
				if (state.bar.timeoutIds.length)
					$.event.trigger(brd.event.barStop);
			}, barSpeed * 2);
		}
	};
	
	convertDateValueToString = function(val) {
		if (val < 10) return '0' + val;
		else return '' + val;
	};
	
	buildDateStrings = function() {
		var currentMoment = brd.cal.getDate(),
			currentYear = currentMoment.year(),
			currentMonth = currentMoment.month() + 1,
			monthString = convertDateValueToString(currentMonth);

		state.dateStrings.yearMonthString = currentYear + '-' + monthString;
		state.dateStrings.currentMonthString = monthString;
	};

	initializeBar = function() {
		var bar = state.bar;
		bar.currentDay = 1;
		bar.currentMonth = state.dateStrings.currentMonthString;
		bar.currentPercent = 0;
		bar.currentBar = $('.brd-bar-' + bar.currentMonth + '-01');
		bar.currentBar.addClass('brd-bar-1 brd-bar-current')
	};

	loadInitialData = function(data) {
		if (!data)
			return false;
		config.daysInMonth = data.endOfMonth;
		set(data.numerator, data.denominator, 'set');
		return true;
	};

	clearState = function() {
		state.$calendar = undefined;
		state.dateStrings = {};
		state.numerator = 0;
		state.denominator = 0;
		state.totalBarPercent = 0;
		config.daysInMonth = undefined;
	};
	
	initModule = function($calendar, data) {
		clearState();
		state.$calendar = $calendar;

		buildDateStrings();
		initializeBar();
		loadInitialData(data);
	};

	return {
		initModule: initModule,
		set: set,
		moving: moving
	};

}());