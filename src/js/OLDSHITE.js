	//OLD WAY... NOT IN USE.
	appendBarsToWeeks = function() {
		var firstDayBar = stateMap.barMap.firstDayOfMonth ,
		firstDayOfNextMonth = stateMap.barMap.firstDayOfNextMonth,
		barMap = stateMap.barMap,
		lastDayBarRow = stateMap.lastDayBarRow,
		$firstDay = jqueryMap.$firstDay,
		$firstDayOfNextMonth = jqueryMap.$firstDayOfNextMonth;
		
		//setting up middle bars
		$.each(jqueryMap.$weeks, function(index, obj) {
			var bar = stateMap.barMap['week' + (1 + index)];
			bar.$div = $(this).find('.fc-day').first().append('<div class="brd-bar" id="brd-bar-' + (1 + index) + '"></div>').find('.brd-bar');
			bar.maxWidth = stateMap.weekWidth;
			bar.nextBar = stateMap.barMap['week' + (2 + index)];
		});
		stateMap.barMap.week1.nextBar = firstDayBar;
		stateMap.barMap.week1.maxWidth = stateMap.weekWidth - stateMap.firstDayBarWidth;
		stateMap.barMap['week' + lastDayBarRow].nextBar = firstDayOfNextMonth;
		stateMap.barMap['week' + lastDayBarRow].maxWidth = stateMap.weekWidth - stateMap.lastDayBarWidth;
		
		firstDayBar.$div = $firstDay.append('<div class="brd-bar" id="brd-bar-firstday"></div>').find('.brd-bar');
		firstDayBar.maxWidth = stateMap.firstDayBarWidth;
		firstDayBar.nextBar = barMap.week2;
		
		firstDayOfNextMonth.$div = $firstDayOfNextMonth.append('<div class="brd-bar" id="brd-bar-firstdaynextmonth"></div>').find('.brd-bar');
		firstDayOfNextMonth.maxWidth = stateMap.lastDayBarWidth;	
		if (lastDayBarRow === 6) {
			firstDayOfNextMonth.nextBar = null;
		} else {
			firstDayOfNextMonth.nextBar = barMap.week6;
		}
		barMap.week6.nextBar = null;
		
		stateMap.currentBar = firstDayBar;
	};

		//convertDollarsToPixels = function(amount) {		
	//	return amount/stateMap.dollarsPerPixel;
	//};
	
	//convertPixelsToDollars = function(pixels) {
	//	return pixels*stateMap.dollarsPerPixel;
	//}

		convertPixelsToPercent = function(pixels) {
		return (pixels/stateMap.dayWidth)*100;
	};

		convertPercentToPixels = function(percent) {
		return (percent/100)*stateMap.dayWidth;
	};


	
	computePixelsPerDollar = function() {
		var weekWidth = jqueryMap.$weeks.width(),
		moment = jqueryMap.$calendar.fullCalendar('getDate'),
		lastDayOfMonth = moment.endOf('month').date();
		
		stateMap.dollarsPerPixel = (configMap.monthlyIncome / lastDayOfMonth) / (weekWidth / 7);
	};

		computeCalendarWidthsInPx= function() {
		var firstWeekExcludingPrevMonth, lastWeekExcludingNextMonth, secondToLastWeekExcludingNextMonth;
		firstWeekExcludingPrevMonth = jqueryMap.$firstWeek.filter('td[data-date^="' + stateMap.dateStrings.yearMonthString + '"]');
		lastWeekExcludingNextMonth = jqueryMap.$lastWeek.filter('td[data-date^="' + stateMap.dateStrings.nextYearMonthString + '"]');
		if (lastWeekExcludingNextMonth.length === 0) {
			secondToLastWeekExcludingNextMonth = jqueryMap.$secondToLastWeek.filter('td[data-date^="' + stateMap.dateStrings.nextYearMonthString + '"]');
		}
		stateMap.dayWidth = jqueryMap.$weeks.width() / 7;
		stateMap.firstDayBarWidth = firstWeekExcludingPrevMonth.length * stateMap.dayWidth;
		stateMap.weekWidth = 7 * stateMap.dayWidth;
		stateMap.pixelsInAMonth = stateMap.$calendar.fullCalendar('getDate').clone().endOf('month').date() * stateMap.dayWidth;
		if (secondToLastWeekExcludingNextMonth) {
			stateMap.lastDayBarWidth = secondToLastWeekExcludingNextMonth.length * stateMap.dayWidth;
			stateMap.lastDayBarRow = 5;
		} else {
			stateMap.lastDayBarWidth = lastWeekExcludingNextMonth.length * stateMap.dayWidth;
			stateMap.lastDayBarRow = 6;
		}
	};







	recalculateBar = function(newMonthlyIncome, newDailyIncome) {
		var currentExpenseAmount = stateMap.currentExpenseAmount,
		currentDay = stateMap.bar.currentDay,
		currentPercent = stateMap.bar.currentPercent,
		newTotalPercent, oldTotalPercent, difference;
		newTotalPercent = (currentExpenseAmount/newDailyIncome) * 100;
		oldTotalPercent = (100 * (currentDay - 1)) + currentPercent;
		difference = newTotalPercent - oldTotalPercent;
		moveBar(difference, 'percent');
	};

	
	moveBar = function(amount, type) {
		var currentBar, newPercent, currentPercent, leftoverPercent,
		addedPercent = convertToPercent(amount, type);
		if (!configMap.monthlyIncome || !stateMap.bar.currentBar || !addedPercent) {
			return false;
		}

		if (type === 'money') {
			currentExpenseAmount(amount);
		}

		currentBar = stateMap.bar.currentBar;
		currentPercent = stateMap.bar.currentPercent;
		newPercent = currentPercent + addedPercent;

		if (amount < 0) {
			if (newPercent > 0) {
				currentBar.animate({width: newPercent + '%'}, configMap.barSpeed, 'linear');
				stateMap.bar.currentPercent = newPercent;
			} else {
				currentBar.animate({width: 0}, configMap.barSpeed, 'linear');
				currentBar = getPrevBar();
				if (currentBar) {
					setTimeout(function() { moveBar(newPercent, 'percent'); }, configMap.barSpeed);
				}
			}
		} else {

			if (newPercent < 100) {
				currentBar.animate({width: newPercent + '%'}, configMap.barSpeed, 'linear');
				stateMap.bar.currentPercent = newPercent;
			} else if (newPercent >= 100) {
				currentBar.animate({width: '100%'}, configMap.barSpeed, 'linear');
				leftoverPercent = newPercent - 100;
				currentBar = getNextBar();
				if (currentBar) {
					setTimeout(function() { moveBar(leftoverPercent, 'percent'); }, configMap.barSpeed);
				} else {
					//do nothing for now... do I want the bar to flow over into the next month?... feeling a no... 
					//later set options: month-to-month, year-to-year, etc.
					//start subtracting loaves.
				}
			}
		}
		return true;
	};



	addMonthlyIncome = function(amount) {
		//move to stateMap?...
		configMap.monthlyIncome += amount;
		return configMap.monthlyIncome;
	};

	addExpense = function(amount) {
		stateMap.currentExpenseAmount += amount;
		return stateMap.currentExpenseAmount;
	};
	monthlyIncome = function(monthlyIncome) {
		if (monthlyIncome) {
			if (configMap.monthlyIncome && monthlyIncome !== configMap.monthlyIncome) {
				//might wanna move this into shell and explicitly call it.
				recalculateBar(monthlyIncome, setDailyIncomeWithMonthlyIncome(monthlyIncome));
			} else {
				setDailyIncomeWithMonthlyIncome(monthlyIncome);
			}
			configMap.monthlyIncome = monthlyIncome;
		}
		return configMap.monthlyIncome;
	};

	dailyIncome = function(dailyIncome) {
		if (dailyIncome) {
			configMap.dailyIncome = dailyIncome;
			//setMonthlyIncomeWithDailyIncome(dailyIncome):
		}
		return configMap.dailyIncome;
	};

	currentExpenseAmount = function(amount) {
		if (amount) {
			stateMap.currentExpenseAmount += amount;
			stateMap.currentMonthPercent = stateMap.currentExpenseAmount / configMap.monthlyIncome;
		}
		return stateMap.currentExpenseAmount;
	};

	setDailyIncomeWithMonthlyIncome = function(monthlyIncome) {
		var daysInMonth = stateMap.$calendar.fullCalendar('getDate').clone().endOf('month').date(),
		amount;
		amount = monthlyIncome/daysInMonth;
		return dailyIncome(amount);
	};
	
	convertDollarsToPercent = function(amount) {
		return (amount/configMap.dailyIncome)*100;
	};
	
	convertPercentToDollars = function(percent) {
		return (percent/100)*configMap.dailyIncome;
	};

	convertToPercent = function(amount, type) {
		if (type === 'percent') {
			return amount;
		} else if (type === 'money') {
			return convertDollarsToPercent(amount);
		} else {
			return false;
		}
	};


