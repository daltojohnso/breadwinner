var brd = (function() {
	'use strict';
	var initModule = function($container) {
		brd.model.initModule();
		brd.shell.initModule($container);
	};
	return {initModule: initModule};
}());
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
			currentPercent: undefined,
			timeoutIds: []
		},
		expenses: undefined,
		income: undefined,
		totalBarPercent: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap, add,
	addIncome, setIncome, getIncome, addExpenses, setExpenses, getExpenses, setSalary, getSalary,
	updateBar, getNextDiv, getPrevDiv, fillCurrentDiv,
	convertDateValueToString, buildYearMonthDateString, appendDivsToDays, initializeBar,
	setDaysInMonth, add, loadInitialData, clearStateMap, subtractExpense, subtractIncome, subtract, set,
	stopBar;

	set = function(newExpenses, newIncome, type) {
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

		//Saving these strings for now... probably need to delete because I doubt I'll do anything with them.
		/*
		nextMonthMoment = currentMoment.clone().add(1, 'month');
		prevMonthMoment = currentMoment.clone().subtract(1, 'month');
		nextMonth = nextMonthMoment.month() + 1;
		nextMonthYear = nextMonthMoment.year();
		prevMonth = prevMonthMoment.month() + 1;
		prevMonthYear = prevMonthMoment.year(); 
		nextMonthString = convertMonthToString(nextMonth);
		prevMonthString = convertMonthToString(prevMonth);

		stateMap.dateStrings.monthString = monthString;
		stateMap.dateStrings.nextYearMonthString = nextMonthYear + '-' + nextMonthString;
		stateMap.dateStrings.prevYearMonthString = prevMonthYear + '-'+ prevMonthString;
		stateMap.dateStrings.firstDayString = yearMonthString + '-01';
		stateMap.dateStrings.nextMonthFirstDayString = stateMap.dateStrings.nextYearMonthString + '-01';
		*/
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
		stateMap.bar.currentBar = $('#brd-bar-1');
		stateMap.bar.currentBar.addClass('brd-bar-1 brd-bar-current')
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
		appendDivsToDays();
		initializeBar();
		loadInitialData(data);
	};

	return {
		initModule: initModule,
		set: set
	};

}());
brd.buttons = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-buttons-main">',
				'<ul>',
					'<li class="brd-buttons-expense">',
						'<a href="#" class="brd-link-transaction pure-button">+</a>',
					'</li>',
					'<li class="brd-buttons-salary">',	
						'<a href="#" class="brd-link-salary pure-button">$</a>',
					'</li>',
				'</ul>',
			'</div>'
		].join('')
	},
	stateMap = {
		$appendTarget: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap;

	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$transactionLink: $appendTarget.find('.brd-link-transaction'),
			$salaryLink: $appendTarget.find('.brd-link-salary')
		}
	}

	initModule = function($appendTarget) {
		stateMap.$appendTarget = $appendTarget;
		$appendTarget.html(configMap.mainHtml);
		setJqueryMap();

		jqueryMap.$transactionLink.click(function(event) {
			$.event.trigger('transactionbuttonclick');
		});
		jqueryMap.$salaryLink.click(function(event) {
			$.event.trigger('salarybuttonclick');
		});
	};

	return {
		initModule: initModule
	};

}());
brd.cal = (function() {
	'use strict';
	var configMap = {
		dateFormat: 'DD-MM-YYYY',
		dayClickTimer: 200,
		eventBackgroundColor: '#FF3333'
	},
	stateMap = {
		$calendar: undefined,
		calendarRatio: undefined,
		windowHeight: undefined,
		dayClicks: 0,
		dayClickTimer: undefined
	},
	jqueryMap = {},
	setJqueryMap, initModule, createEvent, getDate, getDaysInMonth, setCalendarWidth,
	setListeners, showMonth, deleteEvent, addEvents, resizeCalendar, recalculate;
	
	setJqueryMap = function() {
		var $calendar = stateMap.$calendar;
		jqueryMap = {
			$calendar: $calendar,
			$day: $calendar.find('.fc-day'),
			$todayButton: $calendar.find('.fc-today-button'),
			$prevButton: $calendar.find('.fc-prev-button'),
			$nextButton: $calendar.find('.fc-next-button'),
			$buttons: $calendar.find('.fc-button')
		}
	};


	createEvent = function(name, amount, date, type, id) {
		var newEvent,
		dateEvents = stateMap.$calendar.fullCalendar('clientEvents', date.format(configMap.dateFormat));

		if (dateEvents.length) {
			var dateEvent = dateEvents[0];
			if (!dateEvent[id]) {
				dateEvent.count++;
				dateEvent.title = dateEvent.count+'';
				dateEvent[id] = true;
				stateMap.$calendar.fullCalendar('updateEvent', dateEvent);
			}
		} else {
			newEvent = {
				title: '1',
				count: 1,
				start: date,
				backgroundColor: configMap.eventBackgroundColor,
				id: date.format(configMap.dateFormat)
			};
			newEvent[id] = true;
			stateMap.$calendar.fullCalendar('renderEvent', newEvent);
		}
	};

	addEvents = function(events) {
		var event, eventId;
		for (eventId in events) {
			if (events.hasOwnProperty(eventId)) {
				event = events[eventId];
				createEvent(event.name, event.amount, moment(event.date, configMap.dateFormat), event.type, event.id);  //!!!!!!!!!!!!
			}
		}
	};

	getDate = function() {
		return jqueryMap.$calendar.fullCalendar('getDate');
	};

	getDaysInMonth = function() {
		return getDate().clone().endOf('month').date();
	};

	showMonth = function(date) {
		jqueryMap.$calendar.fullCalendar('gotoDate', date);
		$.event.trigger('calendarchange', [date.format('MM-YYYY')]);
	};

	setListeners = function() {
		jqueryMap.$day.on('click', function(e) {
			stateMap.dayClicks++;
			var date = moment($(this).data().date);
			if (stateMap.dayClicks === 1) {
				stateMap.dayClickTimer = setTimeout(function() {
					$.event.trigger('dayclick', [date]);
					stateMap.dayClicks = 0;
				}, configMap.dayClickTimer);
			} else {
				clearTimeout(stateMap.dayClickTimer);
				$.event.trigger('daydbclick', [date]);
				stateMap.dayClicks = 0;
			}
		})
		.on('dbclick', function(e) {
			e.preventDefault();
		});

		$(window).resize(resizeCalendar);
	};

	resizeCalendar = function() {
		var resizeTimer = stateMap.resizeTimer;
		clearTimeout(resizeTimer);
		stateMap.resizeTimer = setTimeout(function() {
			var calendar = jqueryMap.$calendar,
			windowRatio = window.innerWidth / (window.innerHeight - 120);
			calendar.fullCalendar('option', 'aspectRatio', windowRatio);
		}, 300);
	};

	recalculate = function(events) {
		jqueryMap.$day.unbind('click');
		jqueryMap.$day.unbind('dbclick');

		addEvents(events);
		setJqueryMap();
		setListeners();
	};

	initModule = function($calendar) {
		stateMap.$calendar = $calendar;

		$calendar.fullCalendar({
			eventRender: function(thisEvent, element) {
				element.find('.brd-event-close').click(function() {
					stateMap.$calendar.fullCalendar('removeEvents', thisEvent._id);
					$.event.trigger('deletetransaction', [thisEvent])
				});
			},
			eventClick: function(event, jsEvent, view) {

			},
			eventAfterRender: function(event, element, view) {
				$(element).css('width', '50px');
			}
		});
		setJqueryMap();

		//this event doesn't need to be reset on month change, so keeping it here for now.
		jqueryMap.$buttons.click(function(event) {
			var date = jqueryMap.$calendar.fullCalendar('getDate').format('MM-YYYY');
			$.event.trigger('calendarchange', [date]);
		});
		setListeners();
		resizeCalendar();	
	};
	
	return {
		initModule: initModule,
		createEvent: createEvent,
		getDate: getDate,
		getDaysInMonth: getDaysInMonth,
		showMonth: showMonth,
		addEvents: addEvents,
		recalculate: recalculate
	};
	
}());
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
brd.form.day = (function() {
	'use strict';
	var configMap = {
		html: [
			'<div class="brd-form-day-wrapper">',
				'<h3>June 2, 2015</h3>',
				'<div class="brd-form-day-transaction-list">',

				'</div>',
				'<div class="brd-transaction-info">',

				'</div>',
				'<div class="brd-form-day-buttons">',

				'</div>',
			'</div>'
		].join(''),
		infoHtml: [
			'<div class="brd-transaction-info-wrapper">',
				'Name<br>Amount<br>Date',
			'</div>'
		].join(''),
		
		transactionHtml: {

		}
	},
	stateMap = {
		position: 'closed'
	},
	jqueryMap, setJqueryMap, initModule, setListeners,
	open, close, load, loadTransactions, clearTransactions;

	setJqueryMap = function() {
		var $formTarget = stateMap.$formTarget;
		jqueryMap = {
			$formTarget: $formTarget,
			$wrapper: $formTarget.find('.brd-form-day-wrapper'),
			$title: $formTarget.find('.brd-form-day-wrapper h3'),
			$transactionsWrapper: $formTarget.find('.brd-form-day-transaction-list'),
			$transactions: $formTarget.find('.brd-transaction-list-item')
		};
	};

	setListeners = function() {
		jqueryMap.$transactions.click(function() {
			var id = $(this).data().id;
			$.event.trigger('transactionclick', [id]);
		});
	};

	open = function(data) {
		clearTransactions();
		var dateString = moment(data.date, 'DD-MM-YYYY').format('MMMM Do, YYYY');
		jqueryMap.$title.html(dateString);
		jqueryMap.$wrapper.show();
		stateMap.position = 'open';
		if (data && data.transactions) {
			loadTransactions(data.transactions);
			jqueryMap.$transactions = stateMap.$formTarget.find('.brd-transaction-list-item');
			setListeners();
		}
	};

	close = function() {
		jqueryMap.$wrapper.hide();
		stateMap.position = 'closed';
	};

	load = function(data) {

	};

	clearTransactions = function() {
		jqueryMap.$transactionsWrapper.html('');
	};

	loadTransactions = function(transactions) {
		var transaction, alternatingClass,
		$transactionsWrapper = jqueryMap.$transactionsWrapper;
		for (var i = 0, length = transactions.length; i < length; i++) {
			transaction = transactions[i];
			alternatingClass = 'brd-grid-row-' + i%2;
			$transactionsWrapper.append('<div class="brd-transaction-list-item ' + alternatingClass + '" id="transaction'
				 + i + '" data-id="' + transaction.id + '">' + transaction.name + ' - $' + transaction.amount + '</div>');
		}
	};

	//if transaction form is already open, maybe don't open day but just fill date?
	//add a back button to go back to the transaction list.
	initModule = function($formTarget) {
		$formTarget.append(configMap.html);
		stateMap.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();
	};

	return {
		initModule: initModule,
		open: open,
		close: close,
		load: load
	};
	
}());
brd.form = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-form">',
				'<div class="brd-form-head">',
					'<button type="button" class="brd-form-exit">X</button>',
				'</div>',
				'<div class="brd-form-target">',

				'</div>',
				'<div class="brd-form-data">',

				'</div>',
			'</div>'

		].join('')
	},
	stateMap = {
		$appendTarget: undefined,
		formOpen: undefined,
		child: undefined
	},
	initModule, jqueryMap, setJqueryMap, setListeners,
	open, close, show, openChild, load;

	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$form: $appendTarget.find('.brd-form'),
			$exitButton: $appendTarget.find('.brd-form-exit'),
			$formTarget: $appendTarget.find('.brd-form-target'),
			$formData: $appendTarget.find('.brd-form-data')
		};
	};

	setListeners = function() {
		jqueryMap.$exitButton.click(function() {
			close();
		});

		$(document).on('transaction', function(event) {
			close();
		})
		.on('newsalary', function(event) {
			close();
		});

	};

	load = function(child, data) {
		if (stateMap.child === child) {
			brd.form[child].load(data);
		}
	};

	open = function() {
		jqueryMap.$form.css('display', 'block');
		jqueryMap.$form.animate({opacity: 1, bottom: '95px'}, 'fast');
		stateMap.formOpen = true;
	};
	
	close = function() {
		jqueryMap.$form.animate({opacity: 0, bottom: '85px'}, 'fast', function() {
			jqueryMap.$form.css('display', 'none');
			if (stateMap.child)
				brd.form[stateMap.child].close();
			stateMap.child = null;
		});
		stateMap.formOpen = false;
	};

	show = function(child, data) {
		if (!brd.form[child]) 
			return false;
		if (stateMap.child) {
			brd.form[stateMap.child].close();
			brd.form[child].open(data);
		} else {
			open();
			brd.form[child].open(data);
		}
		stateMap.child = child;
		return true;
	};

	initModule = function($appendTarget, salaryData) {
		$appendTarget.append(configMap.mainHtml);
		stateMap.$appendTarget = $appendTarget;
		setJqueryMap();
		setListeners();

		brd.form.transaction.initModule(jqueryMap.$formTarget);
		brd.form.salary.initModule(jqueryMap.$formTarget, salaryData);
		brd.form.day.initModule(jqueryMap.$formTarget);
		
		close();
	};

	return {
		initModule: initModule,
		open: open,
		close: close,
		show: show,
		load: load
	};
}());
brd.form.salary = (function() {
	'use strict';
	var configMap = {
		html: [
			'<div class="brd-form-salary-wrapper">',
				'<form class="brd-form-salary">',
					'<fieldset>',
						'<legend>Set your salary</legend>',

						'<label for="brd-salary-amt">Amount</label>',
						'<input id="brd-salary-amt" class="brd-amt" placeholder="Amount">',

						'<label for="brd-salary-options">Type</label>',
						'<fieldset>',
							'<select id="brd-salary-options">',
								'<option>Monthly</option>',
								'<option>Semi-monthly</option>',
								'<option>Bi-weekly</option>',
								'<option>Weekly</option>',
							'</select>',
						'</fieldset>',

						'<button type="button" class="brd-button-submit brd-button-salary">Submit</button>',
					'</fieldset>',
				'</form>',
			'</div>'
		].join('')
	},
	stateMap = {
		$formTarget: undefined,
		validSalaryAmount: false,
		salary: undefined,
		salaryType: undefined,
		position: undefined
	},
	jqueryMap, setJqueryMap, initModule, setListeners,
	open, close, load, convertToMonthlySalary;

	setJqueryMap = function() {
		var $formTarget = stateMap.$formTarget;
		jqueryMap = {
			$formTarget: $formTarget,
			$wrapper: $formTarget.find('.brd-form-salary-wrapper'),
			$amount: $formTarget.find('#brd-salary-amt'),
			$options: $formTarget.find('#brd-salary-options'),
			$submit: $formTarget.find('.brd-button-salary')
		};
	};

	setListeners = function() {
		jqueryMap.$amount.keyup(function(event) {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass('brd-validation-fail');
			} else {
				$form.removeClass('brd-validation-fail');
			}
		});

		jqueryMap.$submit.click(function(){
			var amount = +jqueryMap.$amount.val(),
			salaryType = stateMap.salaryType, newMonthlyIncome;
			if (amount && !isNaN(amount)) {
				newMonthlyIncome = convertToMonthlySalary(amount, salaryType);
				jqueryMap.$wrapper.hide();
				stateMap.salary = amount;
				stateMap.salaryType = salaryType;

				$.event.trigger('newsalary', [newMonthlyIncome, salaryType]);
				return true;
			}
			return false;
		});

		jqueryMap.$options.change(function() {
			var $form = $(this), type;
			type = $form.val();
			stateMap.salaryType = type;
		});
	};

	convertToMonthlySalary = function(amount, salaryType) {
		if (salaryType === 'Monthly') {
			return amount;
		} else if (salaryType === 'Semi-monthly') {
			return 2*amount;
		} else if (salaryType === 'Bi-weekly') {
			return ((amount * 26)/12);
		} else if (salaryType === 'Weekly') {
			return ((amount * 52)/12);
		}
	};

	open = function() {
		jqueryMap.$wrapper.show();
		stateMap.position = 'open';

		jqueryMap.$amount.val(stateMap.salary);
		jqueryMap.$options.val(stateMap.salaryType);

	};

	close = function() {
		jqueryMap.$wrapper.hide();
		stateMap.position = 'closed';
	};

	initModule = function($formTarget, data) {
		$formTarget.append(configMap.html);
		stateMap.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();

		stateMap.salary = data.salary;
		stateMap.salaryType = data.salaryType;
	};

	return {
		initModule: initModule,
		open: open,
		close: close
	};
	
}());
brd.form.transaction = (function() {
	'use strict';
	var configMap = {
		html: [
				'<div class="brd-form-transaction-wrapper">',
					'<form class="brd-form-transaction" id="brd-form-transaction">',
						'<fieldset>',
							'<legend>Create a transaction</legend>',

							'<fieldset class="brd-radio-fieldset">',
								'<label for="brd-transaction-type-income" class="brd-radio">',
									'<input id="brd-transaction-type-income" class="brd-transaction-type" type="radio" name="transactionType" value="income">',
									'Income',
								'</label>',
								'<label for="brd-transaction-type-expense" class="brd-radio">',
									'<input id="brd-transaction-type-expense" class="brd-transaction-type" type="radio" name="transactionType" value="expense" checked>',
									'Expense',
								'</label>',
							'</fieldset>',

							'<label for="brd-transaction-name">Transaction Name</label>',
							'<input id="brd-transaction-name" placeholder="Transaction Name">',

							'<label for="brd-transaction-amt">Amount</label>',
							'<input id="brd-transaction-amt" class="brd-amt" placeholder="Amount">',

							'<label for="brd-transaction-date">Date</label>',
							'<input id="brd-transaction-date" class="brd-date" placeholder="Date">',

							'<button type="button" class="brd-button-transaction">Submit</button>',
						'</fieldset>',
					'</form>',
				'</div>'
		].join(''),
		dateFormat: 'DD-MM-YYYY',
		updateEvent: 'update',
		newTransactionEvent: 'transaction',
		validationFailCls: 'brd-validation-fail'
	},
	stateMap = {
		$formTarget: undefined,
		position: undefined,
		validTransactionDate: false,
		validTransactionAmount: false,
		radioValue: 'expense',
		submitEvent: undefined,
		tid: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap, validateAmount,
	open, close, reset, setListeners;
	
	setJqueryMap = function() {
		var $formTarget = stateMap.$formTarget;
		jqueryMap = {
			$formTarget: $formTarget,
			$wrapper: $formTarget.find('.brd-form-transaction-wrapper'),
			$name: $formTarget.find('#brd-transaction-name'),
			$amount: $formTarget.find('#brd-transaction-amt'),
			$date: $formTarget.find('#brd-transaction-date'),
			$submit: $formTarget.find('.brd-button-transaction'),
			$radio: $formTarget.find('.brd-transaction-type')
		};
	};

	open = function(data) {
		var name, amount, date;
		jqueryMap.$wrapper.show();
		stateMap.position = 'open';

		if (data && data.id) {
			stateMap.submitEvent = configMap.updateEvent;
			stateMap.tid = data.id;
		} else {
			stateMap.submitEvent = configMap.newTransactionEvent;
		}

		if (data) {
			name = data.name || jqueryMap.$name.val();
			amount = data.amount || jqueryMap.$amount.val();
			date = data.date || jqueryMap.$date.val();
			jqueryMap.$name.val(name);
			jqueryMap.$amount.val(amount);
			jqueryMap.$date.val(date);
		}
	};
	
	close = function() {
		jqueryMap.$wrapper.hide();
		stateMap.position = 'closed';
		jqueryMap.$name.val('');
		jqueryMap.$amount.val('');
		jqueryMap.$date.val(moment().format(configMap.dateFormat));
		stateMap.update = false;
	};

	reset = function() {
		jqueryMap.$amount.val('');
		jqueryMap.$name.val('');
		jqueryMap.$date.val(moment().format(configMap.dateFormat));
		jqueryMap.$radio.last().prop('checked', true);
		stateMap.radioValue = 'expense';
	};

	setListeners = function() {
		jqueryMap.$submit.click(function() {
			var amount = +jqueryMap.$amount.val(),
			name = jqueryMap.$name.val(),
			date = jqueryMap.$date.val(),
			id = stateMap.tid, dateMoment;
			dateMoment = moment(date, configMap.dateFormat);
			if (amount > 0 && !isNaN(amount) && dateMoment.isValid()
				&& name.length <= 20) {
				$.event.trigger('transaction', [name, amount, date, stateMap.radioValue, id]);
				reset();
				close();
				return true;
			}
			return false;
		});
		
		jqueryMap.$amount.keyup(function() {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass(configMap.validationFailCls);
			} else {
				$form.removeClass(configMap.validationFailCls);
			}
		});

		jqueryMap.$date.keyup(function() {
			var $form = $(this);
			var date = moment($form.val());
			if (date.isValid()) {
				$form.removeClass(configMap.validationFailCls);
			} else {
				$form.addClass(configMap.validationFailCls);
			}
		});

		jqueryMap.$name.keyup(function() {
			var $form = $(this);
			var name = $form.val();
			if (name.length > 20) {
				$form.addClass(configMap.validationFailCls);
			} else {
				$form.removeClass(configMap.validationFailCls);
			}
		});

		jqueryMap.$radio.click(function() {
    		stateMap.radioValue = $(this).val();
		});	
	};
	
	initModule = function($formTarget) {
		$formTarget.append(configMap.html);
		stateMap.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();

		rome(document.getElementById('brd-transaction-date'), { time: false, inputFormat: configMap.dateFormat });
		jqueryMap.$date.val(moment().format(configMap.dateFormat));		
	};
	
	return {
		initModule: initModule,
		open: open,
		close: close
	};
}());
brd.model = (function() {
	'use strict';
	var configMap = {
		isConnected: false,
		anonId: 'a0',
		monthFormat: 'MM-YYYY',
		dayFormat: 'DD-MM-YYYY'
	},
	stateMap = {
		user: undefined,
		currentMonth: undefined,
		//an issue with this is on load, this goes back to 0.
		tid: 0,
		storage: undefined
	},
	initModule, save,
	makeUser, makeMonth, makeTransaction,
	addMonth, addTransaction, add, addIncome, addExpense, setSalary,
	getMonthData, getTransaction, deleteTransaction, subtract, subtractExpense,
	subtractIncome, getMonthTransactions, getSalary, getStorageFunction, getTransaction, getDifference;

	subtract = function(amount, type, monthDate) {
		var month = stateMap.user.months[monthDate];
		if (type === 'expense') {
			subtractExpense(Math.abs(amount), month);
		} else if (type === 'income') {
			subtractIncome(Math.abs(amount), month);
		} 
	};

	subtractExpense = function(amount, month) {
		month.expenses -= amount;
	};

	subtractIncome = function(amount, month) {
		month.income -= amount;
	};

	add = function(name, amount, date, type, id) {
		var monthDate = date.slice(3), month, transaction;
		month = stateMap.user.months[monthDate];

		if (!month) {
			month = addMonth(monthDate);
		}

		if (id) {
			var transactions = stateMap.user.months[month.date].transactions;
			for (var tid in transactions) {
				if (transactions.hasOwnProperty(tid) && transactions[tid].id == id) {
					subtract(transactions[tid].amount, transactions[tid].type, month.date);
				}
			}
		}

		transaction = addTransaction(name, amount, date, type, month, id);

		if (type === 'expense') {
			addExpense(amount, month);

		} else if (type === 'income') {
			addIncome(amount, month);
		}

		save(month, transaction);
		return transaction;
	};

	addIncome = function(amount, month) {
		month.income += amount;
	};

	addExpense = function(amount, month) {
		month.expenses += amount;
	};

	save = function(month, transaction) {
		//localStorage.setItem(stateMap.user.id, JSON.stringify(stateMap.user));
		stateMap.storage.setItem(stateMap.user.id, JSON.stringify(stateMap.user));
		$.event.trigger('modelupdate', [transaction, month.expenses, month.income + month.salary]);
	};

	addMonth = function(date, income, expenses, transactions, salary) {
		var month = makeMonth(date, income, expenses, transactions, salary);
		stateMap.user.months[month.date] = month;
		save(month);
		return stateMap.user.months[month.date];
	};

	addTransaction = function(name, amount, date, type, month, id) {
		var transaction, tid;
		//month = stateMap.user.months[date];

		tid = id || Date.now();//stateMap.tid++;
		transaction  = makeTransaction(tid, name, amount, type, date),
		month.transactions[transaction.id] = transaction;

		return {
			id: transaction.id,
			name: transaction.name,
			amount: transaction.amount,
			type: type,
			date: transaction.date
		}
	};

	setSalary = function(amount, type, date) {
		stateMap.user.salary = amount;
		stateMap.user.salaryType = type;
		var month = stateMap.user.months[date];
		month.salary = amount;
		save(month);
	};

	//Sets salary for current month going forward.
	//Will need to wait til next month to change salary if it changes.
	getSalary = function() {
		return {
			salary: stateMap.user.salary,
			salaryType: stateMap.user.salaryType
		};
	};

	makeMonth = function(date, income, expenses, transactions, salary) {
		var userSalary;
		if (!date) return false;

		if (stateMap.user && stateMap.user.salary) {
			userSalary = stateMap.user.salary;
		}

		return {
			date: date,
			income: income || 0,
			expenses: expenses || 0,
			transactions: transactions || {},
			salary: salary || userSalary || 0
		};

	};

	makeTransaction = function(id, name, amount, type, date) {
		return {
			id: id,
			name: name,
			amount: amount,
			type: type,
			date: date
		};
	}

	makeUser = function() {
		var date = moment().format(configMap.monthFormat),
		months = {}, month, user;
		month = makeMonth(date);
		months[month.date] = month;

		user = {
			id: configMap.anonId,
			months: months,
			salary: 0,
			salaryType: 'Monthly'
			//recurringTransactions!
		};
		return user;

	};

	getMonthData = function(date) {
		var month = stateMap.user.months[date],
		endOfMonth;
		//could be better...
		endOfMonth = moment('01-' + date, 'DD-MM-YYYY').endOf('month').date();

		if (!month) {
			month = addMonth(date);
		}

		return {
			date: month.date,
			endOfMonth: endOfMonth,
			expenses: month.expenses,
			income: month.income + month.salary
		};
	};

	//kinda horrible right now...
	getMonthTransactions = function(date) {
		var month, transactions = [], tid;
		if (date.length == configMap.monthFormat.length) {
			month = stateMap.user.months[date];
			if (month && month.transactions) {
				return month.transactions;
			}
		} else if (date.length == configMap.dayFormat.length) {
			month = stateMap.user.months[date.slice(3)];
			if (month && month.transactions) {
				for (tid in month.transactions) {
					if (month.transactions.hasOwnProperty(tid) && month.transactions[tid].date == date) {
						transactions.push(month.transactions[tid]);
					}
				}
				return transactions;
			}
		}


		return false;
	};

	getTransaction = function(id) {
		var month;
		for (var date in stateMap.user.months) {
			month = stateMap.user.months[date];
			if (month.transactions.hasOwnProperty(id)) {
				return month.transactions[id];
			}
		}
		return false;
	};

	deleteTransaction = function(month, tid, amount, type) {
		var transactions = stateMap.user.months[month].transactions;

		for (var id in transactions) {
			if (transactions.hasOwnProperty(id) && transactions[id].id === tid) {
				delete transactions[id];
			}
		}

		subtract(amount, type, month);

		//stateMap.user.months[month].transactions.splice(index, 1);
		save(stateMap.user.months[month]);

	};

	getStorageFunction = function() {
		var testKey = 'test';
		try {
			localStorage.setItem(testKey, '1');
			localStorage.removeItem(testKey);
			return localStorage;
		} catch (error) {
			var storage = (function() {
				var setItem, getItem, removeItem;
				setItem = function(key, value) {
					this[key] = value;
				}
				getItem = function(key) {
					if (this[key]) {
						return this[key];
					}
					return null;
				}
				removeItem = function(key) {
					delete this[key];
				}
				return {setItem: setItem, getItem: getItem, removeItem: removeItem};
			}());
			return storage;
		}
	};

	initModule = function() {
		stateMap.storage = getStorageFunction();
		///var user = localStorage.getItem(configMap.anonId);
		var user = stateMap.storage.getItem(configMap.anonId);
		if (!user) {
			user = makeUser();
			//localStorage.setItem(user.id, JSON.stringify(user));
			stateMap.storage.setItem(user.id, JSON.stringify(user));
			stateMap.user = user;
		} else {
			stateMap.user = JSON.parse(user);
		}
	};

	return {
		initModule: initModule,
		add: add,
		setSalary: setSalary,
		getSalary: getSalary,
		addMonth: addMonth,
		getMonthData: getMonthData,
		deleteTransaction: deleteTransaction,
		getMonthTransactions: getMonthTransactions,
		getTransaction: getTransaction
	};

}());
brd.pay = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-pay">',
				'<div class="brd-pay-head">',
					'<button type="button" class="brd-form-exit">X</button>',
				'</div>',
				'<div class="brd-pay-main">',
					'<form class="pure-form pure-form-stacked brd-form brd-transaction-form" id="brd-transaction-form">',
						'<fieldset>',
							'<legend>Submit a new transaction</legend>',
							'<fieldset class="brd-radio-fieldset">',
								'<label for="brd-transaction-type-income" class="pure-radio">',
									'<input id="brd-transaction-type-income" class="brd-transaction-type" type="radio" name="transactionType" value="income">',
									'Income',
								'</label>',
								'<label for="brd-transaction-type-expense" class="pure-radio brd-transaction-type">',
									'<input id="brd-transaction-type-expense" class="brd-transaction-type" type="radio" name="transactionType" value="expense" checked>',
									'Expense',
								'</label>',
							'</fieldset>',
							'<label for="brd-transaction-name">Transaction Name</label>',
							'<input id="brd-transaction-name" placeholder="Transaction Name">',

							'<label for="brd-transaction-amt">Amount</label>',
							'<input id="brd-transaction-amt" class="brd-amt" placeholder="Amount">',

							'<label for="brd-transaction-date">Date</label>',
							'<input id="brd-transaction-date" class="brd-date" placeholder="Date">',

							//'<label for="brd-recurring" class="pure-checkbox">',
							//	'<input id="brd-recurring" type="checkbox" value="">',
							//	'Recurring',
							//'</label>',
							//'<label for="brd-recurring-options"></label>',
							//'<select id="brd-recurring-options" disabled>',
							//	'<option>Weekly</option>',
							//	'<option>Monthly</option>',
							//'</select>',

							'<button type="button" class="brd-transaction-button pure-button pure-button-primary">Submit</button>',
						'</fieldset>',
					'</form>',

					'<form class="pure-form pure-form-stacked brd-form brd-salary-form" id="brd-salary-form">',
						'<fieldset>',
							'<legend>Set your salary</legend>',

							'<label for="brd-salary-amt">Amount</label>',
							'<input id="brd-salary-amt" class="brd-amt" placeholder="Amount">',

							'<label for="brd-salary-options">Type</label>',
							'<fieldset>',
								'<select id="brd-salary-options">',
									'<option>Monthly</option>',
									'<option>Semi-monthly</option>',
									'<option>Bi-weekly</option>',
									'<option>Weekly</option>',
									//'<option>Hourly</option>',
								'</select>',
								'<label for="brd-salary-hours"></label>',
								'<input id="brd-salary-hours" placeholder="Hours">',
							'</fieldset>',

							'<button type="button" class="brd-salary-button pure-button pure-button-primary">Update</button>',
						'</fieldset>',
					'</form>',
				'</div>',
				'<div class="brd-pay-data">',

				'</div>',
			'</div>'
		].join(''),
		numberRegex: /^\d+(?:\.\d{0,2})$/,
		dateFormat: 'DD-MM-YYYY'
	},
	stateMap = {
		$appendTarget: undefined,
		formOpen: undefined,
		transactionFormOpen: undefined,
		salaryFormOpen: undefined,
		radioValue: 'expense',
		position: 'closed',
		validTransactionDate: false,
		validTransactionAmount: false,
		validSalaryAmount: false,
		salary: undefined,
		salaryType: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap, validateAmount,
	open, close, setListeners, showForm, initForm, setPosition, resetForm, convertToMonthlySalary;
	
	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$payPanel: $appendTarget.find('.brd-pay-main'),
			$transactionType: $appendTarget.find('.brd-transaction-type'),
			$transactionName: $appendTarget.find('#brd-transaction-name'),
			$transactionAmt: $appendTarget.find('#brd-transaction-amt'),
			$transactionDate: $appendTarget.find('#brd-transaction-date'),
			$amountFields: $appendTarget.find('.brd-amt'),
			$dateFields: $appendTarget.find('.brd-date'),
			$submit: $appendTarget.find('.brd-transaction-button'),
			$update: $appendTarget.find('.brd-salary-button'),
			$newMonthlyIncome: $appendTarget.find('#brd-salary-amt'),
			$headerList: $appendTarget.find('.brd-head-tabs li'),

			$forms: $appendTarget.find('.brd-form'),
			$transactionForm: $appendTarget.find('.brd-transaction-form'),
			//$incomeForm: $appendTarget.find('.brd-income-form'),
			$salaryForm: $appendTarget.find('.brd-salary-form'),
			$formExit: $appendTarget.find('.brd-form-exit'),
			$formsDiv: $appendTarget.find('.brd-pay'),
			$salaryType: $appendTarget.find('#brd-salary-options'),
			$hourlyForm: $appendTarget.find('#brd-salary-hours'),
			$salaryAmount: $appendTarget.find('#brd-salary-amt')
		};
	};

	open = function() {
		jqueryMap.$payPanel.show();
	};
	
	close = function() {
		jqueryMap.$payPanel.close();
	};

	showForm = function(form, date) {
		jqueryMap.$formsDiv.show();
		jqueryMap.$forms.hide();
		if (form === 'transaction') {
			jqueryMap.$transactionForm.show();
			if (date) {
				jqueryMap.$transactionDate.val(date);
			}
		//} else if (form === 'income') {
		//	jqueryMap.$incomeForm.show();
		} else if (form === 'salary') {
			jqueryMap.$salaryForm.show();
			jqueryMap.$salaryAmount.val(stateMap.salary);
			jqueryMap.$salaryType.val(stateMap.salaryType);

		} else {
			return false;
		}
	};
	
	validateAmount = function(amount) {
		//update the regex
		//return configMap.numberRegex.test(amount);
	};

	resetForm = function(form) {
		if (form === 'transaction') {

		}
	};

	convertToMonthlySalary = function(amount, salaryType) {
		if (salaryType === 'Monthly') {
			return amount;
		} else if (salaryType === 'Semi-monthly') {
			return 2*amount;
		} else if (salaryType === 'Bi-weekly') {
			return ((amount * 26)/12);
		} else if (salaryType === 'Weekly') {
			return ((amount * 52)/12);
		}
	};
	
	setListeners = function() {
		jqueryMap.$submit.click(function() {
			var amount = +jqueryMap.$transactionAmt.val(),
			name = jqueryMap.$transactionName.val(),
			date = jqueryMap.$transactionDate.val(), dateMoment;
			dateMoment = moment(date, configMap.dateFormat);
			if (amount > 0 && !isNaN(amount) && dateMoment.isValid()) {
				$.event.trigger('transaction', [name, amount, date, stateMap.radioValue]);
				jqueryMap.$transactionAmt.val('');
				jqueryMap.$transactionName.val('');
				jqueryMap.$transactionDate.val(moment().format('DD-MM-YYYY').valueOf());
				jqueryMap.$transactionType.last().prop('checked', true);
				stateMap.radioValue = 'expense';
				jqueryMap.$formsDiv.hide();
				return true;
			}
			return false;
		});
		
		//repeating too much code...
		jqueryMap.$update.click(function() {
			var amount = +jqueryMap.$newMonthlyIncome.val(),
			salaryType = stateMap.salaryType, newMonthlyIncome;
			if (amount && !isNaN(amount)) {
				newMonthlyIncome = convertToMonthlySalary(amount, salaryType);
				jqueryMap.$formsDiv.hide();
				stateMap.salary = amount;
				stateMap.salaryType = salaryType;

				$.event.trigger('salaryupdate', [newMonthlyIncome, salaryType]);
				return true;
			}
			return false;
		});
		
		jqueryMap.$amountFields.keyup(function() {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass('brd-validation-fail');
			} else {
				$form.removeClass('brd-validation-fail');
			}
		});

		jqueryMap.$dateFields.keyup(function() {
			var $form = $(this);
			var date = moment($form.val());
			if (date.isValid()) {
				$form.removeClass('brd-validation-fail');
			} else {
				$form.addClass('brd-validation-fail');
			}
		});
		
		/*jqueryMap.$headerList.click(function() {
			if ($(this).hasClass('brd-tab-inactive')) {
				$('.brd-head-tabs li').addClass('brd-tab-inactive');
				$(this).removeClass('brd-tab-inactive');
			}
			
			if (this.id === 'brd-tab-income') {
				$('.brd-form').hide();
				$('.brd-monthly-income').show();
			} else if (this.id === 'brd-tab-expense') {
				$('.brd-form').hide();
				$('.brd-expense-form').show();
				
			}
		});*/

		jqueryMap.$salaryType.change(function() {
			var $form = $(this), type;
			type = $form.val();
			stateMap.salaryType = type;
			if (type === 'Hourly') {
				jqueryMap.$hourlyForm.show();
			} else {
				jqueryMap.$hourlyForm.hide();
			}
		});

		jqueryMap.$formExit.click(function() {
			jqueryMap.$formsDiv.hide();
		});

		jqueryMap.$transactionType.click(function() {
    		stateMap.radioValue = $(this).val();
		});

		/*$('body').click(function() {
			jqueryMap.$formsDiv.hide();
		});

		$('.brd-pay, .brd-buttons-main, .fc-body, button').click(function(event) {
			event.stopPropagation();
		});*/
	};

	initForm = function() {
		//eventualy wanna pass in a boolean to see whether the user has added a salary to set it to the appropriate form on start.
		
		$('.brd-form').hide();
		$('.brd-salary-form').show();
		//$('.brd-pay').hide();
		//stateMap.formOpen = false;
		//stateMap.transactionFormOpen = false;
		//stateMap.salaryFormOpen = true;
	};

	setPosition = function(position, callback) {
		var height, speed;
		if (stateMap.position === position) {
			return true;
		}

		if (position === 'opened') {
			height = '438px';
			speed = 100;
		} else if (position === 'closed') {
			speed = 100;
			height = 0;
		} else {
			return false;
		}

	//	jqueryMap.$formsDiv.animate(
	//		height: height,
	//		speed);
		return true;

	};
	
	initModule = function($appendTarget, salaryData) {
		var calendar1;
		$appendTarget.append(configMap.mainHtml);
		stateMap.$appendTarget = $appendTarget;
		setJqueryMap();
		setListeners();
		initForm();

		calendar1 = document.getElementById('brd-expense-date');
		//calendar2 = document.getElementById('brd-date-input_02');
		rome(document.getElementById('brd-transaction-date'), { time: false, inputFormat: 'DD-MM-YYYY' });
	//rome(document.getElementById('brd-income-date'), { time: false, inputFormat: 'DD MM YYYY'});
		jqueryMap.$transactionDate.val(moment().format('DD-MM-YYYY').valueOf());
	//	$('.brd-income-date').val(moment().format('DD MM YYYY').valueOf());

		//want a +/- option for transactions
		//a multiplier?
		//recurring transactions!


		jqueryMap.$hourlyForm.hide();
		jqueryMap.$formsDiv.hide();


		stateMap.salary = salaryData.salary;
		stateMap.salaryType = salaryData.salaryType;
		
	};
	
	return {
		initModule: initModule,
		open: open,
		close: close,
		showForm: showForm,
		setPosition: setPosition
	};
}());
brd.shell = (function() {
	'use strict';
	var configMap = {
		mainHtml:	'<div class="brd-shell-head">' +
						'<div class="brd-shell-head-logo">' +
							'<h1>breadWinner</h1>' +
						'</div>' +
					'</div>' +
					'<div class="brd-shell-main">' +
						'<div class="brd-shell-main-cal-outer">' +
							'<div class="brd-shell-main-cal"></div>' + 
						'</div>' +
						'<div class="brd-shell-main-form"></div>' +
					'</div>' +
					'<div class="brd-shell-foot">' +
						'<div class="brd-shell-main-buttons"></div>' +
					'</div>',
		dateFormat: 'DD-MM-YYYY',
		monthDateFormat: 'MM-YYYY'
	},
	stateMap = {
		$container: undefined
	},
	jqueryMap = {},
	setJqueryMap, initModule, setupListeners;
	
	setJqueryMap = function() {
		var $container = stateMap.$container;
		jqueryMap = {
			$container: $container,
			$calendar: $container.find('.brd-shell-main-cal'),
			$form: $container.find('.brd-shell-main-form'),
			$buttons: $container.find('.brd-shell-main-buttons')
		};
	};

	setupListeners = function() {
		$(document)
		.on('transaction', function(event, name, amount, date, type, id) {
			brd.model.add(name, amount, date, type, id);
		})
		.on('newsalary', function(event, salary, salaryType) {
			var monthMoment = moment().format(configMap.monthDateFormat);
			brd.model.setSalary(salary, salaryType, monthMoment);
		})
		.on('modelupdate', function(event, transaction, totalExpenses, totalIncome) {
			var transactionMoment, calendarMoment = brd.cal.getDate();
			if (transaction) {
				transactionMoment = moment(transaction.date, configMap.dateFormat);
			} else {
				transactionMoment = moment();
			}

			if (transactionMoment.month() === calendarMoment.month()) {
				if (transaction) {
					brd.cal.createEvent(transaction.name, transaction.amount, transactionMoment, transaction.type, transaction.id);
				}
				brd.bar.set(totalExpenses, totalIncome, 'update');
			} else {
				brd.cal.showMonth(transactionMoment);
			}
		});

		$(document)
		.on('calendarchange', function(event, monthDateString) {
			var monthData = brd.model.getMonthData(monthDateString),
			monthTransactions = brd.model.getMonthTransactions(monthDateString);

			brd.bar.initModule(jqueryMap.$calendar, monthData);
			brd.cal.recalculate(monthTransactions);
		})
		.on('deletetransaction', function(event, transaction) {
			var amount = +transaction.amount,
			type = transaction.type,
			tid = transaction.id,
			month = transaction.start.format(configMap.monthDateFormat);

			brd.model.deleteTransaction(month, tid, amount, type);
		})
		.on('transactionclick', function(event, id) {
			var transaction = brd.model.getTransaction(id);
			if (transaction) {
				brd.form.show('transaction', {name: transaction.name, amount: transaction.amount, date: transaction.date, id: id});
			}
		});

		$(document)
		.on('transactionbuttonclick', function() {
			brd.form.show('transaction');
		})
		.on('salarybuttonclick', function() {
			brd.form.show('salary');
		})
		.on('dayclick', function(event, date) {
			var dateString = date.format(configMap.dateFormat),
			transactions = brd.model.getMonthTransactions(dateString);

			brd.form.show('day', {transactions: transactions, date: dateString});
		})
		.on('daydbclick', function(event, date) {
			var dateString = date.format(configMap.dateFormat);
			brd.form.show('transaction', {date: dateString});
		});
	};
	
	initModule = function($container) {
		var monthData, monthTransactions, momentString, salaryData;
		stateMap.$container = $container;
		$container.html(configMap.mainHtml);

		setJqueryMap();
		setupListeners();

		momentString = moment().format(configMap.monthDateFormat);
		monthData = brd.model.getMonthData(momentString);
		monthTransactions = brd.model.getMonthTransactions(momentString);
		salaryData = brd.model.getSalary();

		brd.cal.initModule(jqueryMap.$calendar);
		brd.cal.addEvents(monthTransactions);
		brd.bar.initModule(jqueryMap.$calendar, monthData);
		brd.form.initModule(jqueryMap.$form, salaryData);
		brd.buttons.initModule(jqueryMap.$buttons);
	};
	
	return {initModule: initModule};
}());
brd.util = (function() {
	var makeError, setConfigMap;

	makeError = function(nameText, msgText, data) {
		var error = new Error();
		error.name = nameText;
		error.message = msgText;
		if (data) {
			error.data = data;
		}
		return error;
	};

	setConfigMap = function(argMap) {
		var inputMap = argMap.inputMap,
		settableMap = argMap.settableMap,
		configMap = argMap.configMap,
		keyName,
		error;

		for (keyName in inputMap) {
			if (inputMap.hasOwnProperty(keyName)) {
				if (settableMap.hasOwnProperty(keyName)) {
					configMap[keyName] = inputMap[keyName];
				} else {
					error = makeError('Bad Input',
					 'Setting config key |' + keyName + '| is not supported');
					throw error;
				}
			}
		}
	};

	return {
		makeError: makeError,
		setConfigMap: setConfigMap
	};
}());