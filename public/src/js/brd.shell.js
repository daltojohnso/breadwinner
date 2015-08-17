brd.shell = (function() {
	'use strict';
	var state = {
		$container: undefined
	},
	jqueryMap = {},
	setJqueryMap, initModule, setupListeners;
	
	setJqueryMap = function() {
		var $container = state.$container;
		jqueryMap = {
			$container: $container,
			$calendar: $container.find('.brd-shell-main-cal'),
			$form: $container.find('.brd-form'),
			$buttons: $container.find('.brd-buttons'),
			$login: $container.find('.brd-login')
		};
	};

	setupListeners = function() {
		$(document)
			//model

			//calendar events
			.on('calendarchange', function(event, monthDateString) {
				var monthData = brd.model.getMonthData(monthDateString),
					monthTransactions = brd.model.getMonthTransactions(monthDateString);

				brd.cal.recalculate(monthTransactions, monthData);
			})
			.on('dayclick', function(event, date) {
				var dateString = date.format(brd.date.format.ymd),
					transactions = brd.model.getMonthTransactions(dateString);

				brd.form.show('day', {transactions: transactions, date: dateString});
			})
			.on('daydbclick', function(event, date) {
				var dateString = date.format(brd.date.format.ymd);
				brd.form.show('transaction', {date: dateString});
			})
			.on('monthclick', function(event, date) {

			});

			//form

		$(document)
			.on('transaction', function(event, name, amount, date, type, id) {
				brd.model.add(name, amount, date, type, id);
			})
			.on('newsalary', function(event, salary, salaryType) {
				var monthMoment = moment().format(brd.date.format.ym);
				brd.model.setSalary(salary, salaryType, monthMoment);
			})
			.on('modelupdate', function(event, transaction, totalExpenses, totalIncome) {
				var transactionMoment, calendarMoment = brd.cal.getDate();
				if (transaction) {
					transactionMoment = moment(transaction.date, brd.date.format.ymd);
				} else {
					transactionMoment = moment();
				}

				if (transactionMoment.month() === calendarMoment.month()) {
					if (transaction) {
						brd.cal.createEvent(transaction.name, transaction.amount, transactionMoment, transaction.type, transaction.id);
					}
					brd.cal.set(totalExpenses, totalIncome, 'update');
				} else {
					brd.cal.showMonth(transactionMoment);
				}
			});

		$(document)
			.on('deletetransaction', function(event, transaction) {
				var amount = +transaction.amount,
				type = transaction.type,
				tid = transaction.id,
				month = transaction.start.format(brd.date.format.ym);

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
			});

	};
	
	initModule = function($container, name) {
		var barData, monthTransactions, momentString, salaryData;
		state.$container = $container;
		$container.html(brd.templates.shell);

		setJqueryMap();
		setupListeners();

		momentString = moment().format(brd.date.format.ym);
		barData = brd.model.getMonthData(momentString);
		monthTransactions = brd.model.getMonthTransactions(momentString);
		salaryData = brd.model.getSalary();

		brd.cal.initModule(jqueryMap.$calendar, barData);
		brd.cal.addEvents(monthTransactions);
		brd.form.initModule(jqueryMap.$form, salaryData);
		brd.buttons.initModule(jqueryMap.$buttons);
		brd.login.initModule(jqueryMap.$login);

		brd.login.login(name);

	};
	
	return {initModule: initModule};
}());