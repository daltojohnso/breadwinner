var brd = (function() {
	'use strict';
	var initModule, event;

	event = {
		modelUpdate: 'brd-modelUpdate',
		transactionDeleted: 'brd-transactionDeleted',

		calendarChange: 'brd-calendarChange',
		dayClick: 'brd-dayClick',
		dayDbClick: 'brd-dayDbClick',
		monthClick: 'brd-monthClick',
		barStop: 'brd-barStop',

		newTransaction: 'brdTransaction',
		salaryUpdate: 'brd-salaryUpdate',
		deleteTransaction: 'brd-deleteTransaction',
		transactionClick: 'brd-transactionClick',
		transactionButtonClick: 'brd-transactionButtonClick',
		salaryButtonClick: 'brd-salaryButtonClick'
	};

	initModule = function($container) {
		brd.model.initModule(false);
		brd.shell.initModule($container);
	};

	return {
		initModule: initModule,
		event: event
	};
}());