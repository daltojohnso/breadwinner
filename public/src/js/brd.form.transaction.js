brd.form.transaction = (function() {
	'use strict';
	var config = {
		dateFormat: 'YYYY-MM-DD',
		updateEvent: 'update',
		newTransactionEvent: 'transaction',
		validationFailCls: 'brd-validation-fail'
	},
	state = {
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
		var $formTarget = state.$formTarget;
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
		state.position = 'open';

		if (data && data.id) {
			state.submitEvent = config.updateEvent;
			state.tid = data.id;
		} else {
			state.submitEvent = config.newTransactionEvent;
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
		state.position = 'closed';
		state.update = false;

		reset();
	};

	reset = function() {
		jqueryMap.$amount.val('');
		jqueryMap.$name.val('');
		jqueryMap.$date.val(moment().format(config.dateFormat));
		jqueryMap.$radio.last().prop('checked', true);
		state.radioValue = 'expense';
		state.tid = undefined;
	};

	setListeners = function() {
		jqueryMap.$submit.click(function() {
			var amount = +jqueryMap.$amount.val(),
			name = jqueryMap.$name.val(),
			date = jqueryMap.$date.val(),
			id = state.tid, dateMoment;
			dateMoment = moment(date, config.dateFormat);
			if (amount > 0 && !isNaN(amount) && dateMoment.isValid()
				&& name.length <= 20) {
				$.event.trigger(brd.event.newTransaction, [name, amount, date, state.radioValue, id]);
				reset();
				return true;
			}
			return false;
		});
		
		jqueryMap.$amount.keyup(function() {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass(config.validationFailCls);
			} else {
				$form.removeClass(config.validationFailCls);
			}
		});

		jqueryMap.$date.keyup(function() {
			var $form = $(this);
			var date = moment($form.val());
			if (date.isValid()) {
				$form.removeClass(config.validationFailCls);
			} else {
				$form.addClass(config.validationFailCls);
			}
		});

		jqueryMap.$name.keyup(function() {
			var $form = $(this);
			var name = $form.val();
			if (name.length > 20) {
				$form.addClass(config.validationFailCls);
			} else {
				$form.removeClass(config.validationFailCls);
			}
		});

		jqueryMap.$radio.click(function() {
    		state.radioValue = $(this).val();
		});	
	};
	
	initModule = function($formTarget) {
		$formTarget.append(brd.templates.transaction);
		state.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();

		jqueryMap.$date.val(moment().format(config.dateFormat));
	};
	
	return {
		initModule: initModule,
		open: open,
		close: close
	};
}());