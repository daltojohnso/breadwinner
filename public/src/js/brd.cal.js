brd.cal = (function() {
	'use strict';
	var config = {
		dayClickTimer: 200,
		eventBackgroundColor: '#FF3333'
		},
		state = {
			$calendar: undefined,
			calendarRatio: undefined,
			windowHeight: undefined,
			dayClicks: 0,
			dayClickTimer: undefined
		},
		jqueryMap, setJqueryMap, setListeners, initModule, resize,
		setListeners, setExpiringListeners, setStaticListeners,
		getDate, showMonth,
		createEvent, addEvents,
		recalculate, set;
	
	setJqueryMap = function() {
		var $calendar = state.$calendar;
		jqueryMap = {
			$calendar: $calendar,
			$day: $calendar.find('.fc-day'),
			$todayButton: $calendar.find('.fc-today-button'),
			$prevButton: $calendar.find('.fc-prev-button'),
			$nextButton: $calendar.find('.fc-next-button'),
			$buttons: $calendar.find('.fc-button'),
			$month: $calendar.find('.fc-left h2')
		};
	};

	getDate = function() {
		return jqueryMap.$calendar.fullCalendar('getDate');
	};

	showMonth = function(date) {
		jqueryMap.$calendar.fullCalendar('gotoDate', date);
		$.event.trigger('calendarchange', [date.format(brd.date.format.ym)]);
	};

	createEvent = function(name, amount, date, type, id) {
		var newEvent,
		dateEvents = state.$calendar.fullCalendar('clientEvents', date.format(brd.date.format.ymd));

		if (dateEvents[0]) {
			var dateEvent = dateEvents[0];
			if (!dateEvent[id]) {
				dateEvent.count++;
				dateEvent.title = dateEvent.count+'';
				dateEvent[id] = true;
				state.$calendar.fullCalendar('updateEvent', dateEvent);
			}
		} else {
			newEvent = {
				title: '1',
				count: 1,
				start: date,
				backgroundColor: config.eventBackgroundColor,
				id: date.format(brd.date.format.ymd)
			};
			newEvent[id] = true;
			state.$calendar.fullCalendar('renderEvent', newEvent);
		}
	};

	addEvents = function(events) {
		var event, eventId;
		for (eventId in events) {
			if (events.hasOwnProperty(eventId)) {
				event = events[eventId];
				createEvent(event.name, event.amount, moment(event.date, brd.date.format.ymd), event.type, event.id);
			}
		}
	};

	resize = function() {
		var resizeTimer = state.resizeTimer;
		clearTimeout(resizeTimer);
		state.resizeTimer = setTimeout(function() {
			var calendar = jqueryMap.$calendar,
				windowRatio = window.innerWidth / (window.innerHeight + 100);
			calendar.fullCalendar('option', 'aspectRatio', windowRatio);
		}, 300);
	};

	recalculate = function(events, barData) {
		brd.cal.bar.initModule(jqueryMap.$calendar, barData);
		jqueryMap.$day.unbind('click');
		jqueryMap.$day.unbind('dbclick');

		addEvents(events);
		setJqueryMap();
		setExpiringListeners();
	};

	set = function() {
		brd.cal.bar.set.apply(null, arguments);
	};

	setListeners = function() {
		setExpiringListeners();
		setStaticListeners();
	};

	setExpiringListeners = function() {
		jqueryMap.$day
			.on('click', function() {
				state.dayClicks++;
				var date = moment($(this).data().date);
				if (state.dayClicks === 1) {
					state.dayClickTimer = setTimeout(function() {
						$.event.trigger('dayclick', [date]);
						state.dayClicks = 0;
					}, config.dayClickTimer);
				} else {
					clearTimeout(state.dayClickTimer);
					$.event.trigger('daydbclick', [date]);
					state.dayClicks = 0;
				}
			})
			.on('dbclick', function(e) {
				e.preventDefault();
			});

		jqueryMap.$month
			.click(function() {
				var date = state.$calendar.fullCalendar('getDate').format(brd.date.format.ym);
				$.event.trigger('monthclick', [date]);
			});

		$(window).resize(resize);
	};

	setStaticListeners = function() {
		jqueryMap.$buttons.click(function() {
			var date = jqueryMap.$calendar.fullCalendar('getDate').format(brd.date.format.ym);
			$.event.trigger('calendarchange', [date]);
		});
	};

	initModule = function($calendar, barData) {
		state.$calendar = $calendar;

		$calendar.fullCalendar({
			eventRender: function(thisEvent, element) {
				element.find('.brd-event-close').click(function() {
					state.$calendar.fullCalendar('removeEvents', thisEvent._id);
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
		setListeners();
		resize();

		brd.cal.bar.initModule(jqueryMap.$calendar, barData);
	};
	
	return {
		initModule: initModule,
		createEvent: createEvent,
		getDate: getDate,
		showMonth: showMonth,
		addEvents: addEvents,
		recalculate: recalculate,
		set: set
	};
	
}());