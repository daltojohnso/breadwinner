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