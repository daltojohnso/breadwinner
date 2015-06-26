brd.shell = (function() {
	'use strict';
	var configMap = {
		mainHtml:	'<div class="brd-shell-head">' +
						//'<div class="brd-shell-head-logo">' +
						//	'<h1>breadWinner</h1>' +
						//'</div>' +
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
		dateFormat: 'DD-MM-YYYY'
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

		$(document).on('transaction', function(event, name, amount, date, type, id) {
			brd.model.add(name, amount, date, type, id);
		})
		.on('salaryupdate', function(event, salary, salaryType) {
			var monthMoment = moment().format('MM-YYYY');
			brd.model.setSalary(salary, salaryType, monthMoment);
		})
		.on('modelupdate', function(event, transaction, totalExpenses, totalIncome) {
			var transactionMoment, calendarMoment;

			if (transaction) {
				transactionMoment = moment(transaction.date, configMap.dateFormat);
			} else {
				transactionMoment = moment();
			}
			calendarMoment = brd.cal.getDate();

			if (transactionMoment.month() === calendarMoment.month()) {
				if (transaction)
					brd.cal.createEvent(transaction.name, transaction.amount, transactionMoment, transaction.type, transaction.id);
				brd.bar.set(totalExpenses, totalIncome, 'update');
			} else {
				brd.cal.showMonth(transactionMoment);
			}

		})
		.on('calendarchange', function(event, monthDateString) {
			var monthData = brd.model.getMonthData(monthDateString),
			monthTransactions = brd.model.getMonthTransactions(monthDateString);

			brd.bar.initModule(jqueryMap.$calendar, monthData);
			brd.cal.addEvents(monthTransactions);

			//brd.cal should be a black box in regards to things like this.
			//in this case, cal triggers event, and then it takes it going back to the shell before it is told to recalc listeners, etc.
			//should do it itself.
			brd.cal.recalculate(monthTransactions);
		})
		.on('deletetransaction', function(event, transaction) {
			var amount = +transaction.amount, type = transaction.type,
			tid = transaction.id,
			month = transaction.start.format('MM-YYYY');
			brd.model.deleteTransaction(month, tid, amount, type);
		})
		.on('transactionClick', function(event, id) {
			var transaction = brd.model.getTransaction(id);
			if (transaction) {
				brd.form.show('transaction', {name: transaction.name, amount: transaction.amount, date: transaction.date, id: id});
			}
		});

		$(document)
		.on('transactionLinkClick', function() {
			brd.form.show('transaction');
		})
		.on('salaryLinkClick', function() {
			brd.form.show('salary');
		})
		.on('dayclick', function(event, date) {
			var dateString = date.format('DD-MM-YYYY');
			///brd.form.show('transaction', {date: dateString});
			var transactions = brd.model.getMonthTransactions(dateString);
			brd.form.show('day', {transactions: transactions, date: dateString});
		})
		.on('daydbclick', function(event, date) {
			var dateString = date.format(configMap.dateFormat);
			brd.form.show('transaction', {date: dateString});
		});
	}
	
	initModule = function($container) {
		var monthData, monthTransactions, momentString, salaryData;
		stateMap.$container = $container;
		$container.html(configMap.mainHtml);
		setJqueryMap();
		setupListeners();
		momentString = moment().format('MM-YYYY');
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