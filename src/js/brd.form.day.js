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