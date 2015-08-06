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
							'<input id="brd-transaction-date" class="brd-date" placeholder="Date" type="date">',

							'<button type="button" class="brd-button-transaction">Submit</button>',
						'</fieldset>',
					'</form>',
				'</div>'
		].join(''),
		dateFormat: 'YYYY-MM-DD',
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
	initModule, setJqueryMap,
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

		jqueryMap.$date.val(moment().format(configMap.dateFormat));
	};
	
	return {
		initModule: initModule,
		open: open,
		close: close
	};
}());