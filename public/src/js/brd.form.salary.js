brd.form.salary = (function() {
	'use strict';
	var state = {
		$formTarget: undefined,
		validSalaryAmount: false,
		salary: undefined,
		salaryType: undefined,
		position: undefined
	},
	jqueryMap, setJqueryMap, initModule, setListeners,
	open, close, convertToMonthlySalary;

	setJqueryMap = function() {
		var $formTarget = state.$formTarget;
		jqueryMap = {
			$formTarget: $formTarget,
			$wrapper: $formTarget.find('.brd-form-salary-wrapper'),
			$amount: $formTarget.find('#brd-salary-amt'),
			$options: $formTarget.find('#brd-salary-options'),
			$submit: $formTarget.find('.brd-button-salary')
		};
	};

	setListeners = function() {
		jqueryMap.$amount.keyup(function(event) {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass('brd-validation-fail');
			} else {
				$form.removeClass('brd-validation-fail');
			}
		});

		jqueryMap.$submit.click(function(){
			var amount = +jqueryMap.$amount.val(),
			salaryType = state.salaryType, newMonthlyIncome;
			if (amount && !isNaN(amount)) {
				newMonthlyIncome = convertToMonthlySalary(amount, salaryType);
				//jqueryMap.$wrapper.hide();
				state.salary = amount;
				state.salaryType = salaryType;

				$.event.trigger(brd.event.salaryUpdate, [newMonthlyIncome, salaryType]);
				return true;
			}
			return false;
		});

		jqueryMap.$options.change(function() {
			var $form = $(this), type;
			type = $form.val();
			state.salaryType = type;
		});
	};

	convertToMonthlySalary = function(amount, salaryType) {
		if (salaryType === 'Monthly') {
			return amount;
		} else if (salaryType === 'Semi-monthly') {
			return 2*amount;
		} else if (salaryType === 'Bi-weekly') {
			return ((amount * 26)/12);
		} else if (salaryType === 'Weekly') {
			return ((amount * 52)/12);
		}
	};

	open = function() {
		jqueryMap.$wrapper.show();
		state.position = 'open';

		jqueryMap.$amount.val(state.salary);
		jqueryMap.$options.val(state.salaryType);

	};

	close = function() {
		jqueryMap.$wrapper.hide();
		state.position = 'closed';
	};

	initModule = function($formTarget, data) {
		$formTarget.append(brd.templates.salary);
		state.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();

		state.salary = data.salary;
		state.salaryType = data.salaryType;
	};

	return {
		initModule: initModule,
		open: open,
		close: close
	};
	
}());