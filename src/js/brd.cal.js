brd.cal = (function() {
	'use strict';
	var configMap = {
		defaultRatio: 2.15
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
		//var event, color;
		var newEvent;
		var dateEvents = stateMap.$calendar.fullCalendar('clientEvents', date.format('DD-MM-YYYY'));

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
				backgroundColor: '#FF3333',
				id: date.format('DD-MM-YYYY')
			};
			newEvent[id] = true;
			stateMap.$calendar.fullCalendar('renderEvent', newEvent);

		}
		/*if (type === 'expense') {
			color = '#FF3333';
		} else {
			color = '#338533';
		}*/

		/*event = {
			title: name + ' - $' + amount,
			start: date,
			description: amount,
			amount: amount,
			type: type,
			id: id,
			backgroundColor: color,
			borderColor: '#888'

		};*/
	
	};

	addEvents = function(events) {
		var event, eventId;
		for (eventId in events) {
			if (events.hasOwnProperty(eventId)) {
				event = events[eventId];
				createEvent(event.name, event.amount, moment(event.date, 'DD-MM-YYYY'), event.type, event.id);  //!!!!!!!!!!!!
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
				}, 200);
			} else {
				clearTimeout(stateMap.dayClickTimer);
				$.event.trigger('daydbclick', [date]);
				stateMap.dayClicks = 0;
			}
		})
		.on('dbclick', function(e) {
			e.preventDefault();
		});

		/*jqueryMap.$day.dblclick(function(event) {
			clearTimeout(stateMap.clickEvent);
			var date = $(this).data().date;
			date = moment(date);
			$.event.trigger('daydbclick', [date]);
		});*/

		$(window).resize(resizeCalendar);
	};

	resizeCalendar = function() {
		var resizeTimer;
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			var width = window.innerWidth,
			calendar = jqueryMap.$calendar,
			windowHeight = window.innerHeight,
			windowRatio = window.innerWidth / (window.innerHeight - 120);
			calendar.fullCalendar('option', 'aspectRatio', windowRatio);
		}, 300);
	};

	recalculate = function(events) {
		//jqueryMap.$buttons.unbind('click');
		jqueryMap.$day.unbind('click');
		jqueryMap.$day.unbind('dbclick');
		//unbinding button click breaks it... why?

		addEvents(events);
		setJqueryMap();
		setListeners();
	};

	initModule = function($calendar) {
		stateMap.$calendar = $calendar;
		$calendar.fullCalendar({
		//	dayClick: function(date, jsEvent, view) {
			//	stateMap.clickEvent = setTimeout(function() {
			//		$.event.trigger('dayclick', [date]);
			//	}, 300);		
		//	},
			eventRender: function(thisEvent, element) {
				//element.append('<span class="brd-event-close">X</span>');
				element.find('.brd-event-close').click(function() {
					stateMap.$calendar.fullCalendar('removeEvents', thisEvent._id);
					$.event.trigger('deletetransaction', [thisEvent])
				});
				///element.qtip({
				//	content: event.description
				//});
			},
			eventClick: function(event, jsEvent, view) {
				//destroyEvent();
				//$.event.trigger('destroyEvent' [event])
			},
			eventAfterRender: function(event, element, view) {
				$(element).css('width', '50px');
			}
		});
		setJqueryMap();

		jqueryMap.$buttons.click(function(event) {
			var date = jqueryMap.$calendar.fullCalendar('getDate').format('MM-YYYY');
			$.event.trigger('calendarchange', [date]);
		});
		
		setListeners();

		configMap.windowRatio = window.innerWidth / window.innerHeight;
		resizeCalendar();


		brd.cal.num.initModule(jqueryMap.$calendar);
		//trigger 'newMonthShown' to start off the data loading process?




		
	};
	
	return {
		initModule: initModule,
		createEvent: createEvent,
		getDate: getDate,
		getDaysInMonth: getDaysInMonth,
		showMonth: showMonth,
		recalculate: recalculate,
		addEvents: addEvents
	};
	
}());