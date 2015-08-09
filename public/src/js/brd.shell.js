brd.shell = (function() {
	'use strict';
	var configMap = {
		dateFormat: 'YYYY-MM-DD',
		dateFormatInput: 'YYYY-MM-DD',
		monthDateFormat: 'YYYY-MM'
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
			$form: $container.find('.brd-form'),
			$buttons: $container.find('.brd-buttons')
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
				brd.cal.set(totalExpenses, totalIncome, 'update');
			} else {
				brd.cal.showMonth(transactionMoment);
			}
		});

		$(document)
		.on('calendarchange', function(event, monthDateString) {
			var monthData = brd.model.getMonthData(monthDateString),
			monthTransactions = brd.model.getMonthTransactions(monthDateString);

			brd.cal.recalculate(monthTransactions, monthData);
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
			var dateString = date.format(configMap.dateFormatInput);
			brd.form.show('transaction', {date: dateString});
		});
	};
	
	initModule = function($container) {
		var monthData, monthTransactions, momentString, salaryData;
		stateMap.$container = $container;
		$container.html(brd.templates.shell);

		setJqueryMap();
		setupListeners();

		momentString = moment().format(configMap.monthDateFormat);
		monthData = brd.model.getMonthData(momentString);
		monthTransactions = brd.model.getMonthTransactions(momentString);
		salaryData = brd.model.getSalary();

		brd.cal.initModule(jqueryMap.$calendar, monthData);
		brd.cal.addEvents(monthTransactions);
		brd.form.initModule(jqueryMap.$form, salaryData);
		brd.buttons.initModule(jqueryMap.$buttons);
	};
	
	return {initModule: initModule};
}());