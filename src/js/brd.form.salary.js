brd.form.salary = (function() {
	'use strict';
	var configMap = {
		html: [
			'<div class="brd-form-salary-wrapper">',
				'<form class="brd-form-salary">',
					'<fieldset>',
						'<legend>Set your salary</legend>',

						'<label for="brd-salary-amt">Amount</label>',
						'<input id="brd-salary-amt" class="brd-amt" placeholder="Amount">',

						'<label for="brd-salary-options">Type</label>',
						'<fieldset>',
							'<select id="brd-salary-options">',
								'<option>Monthly</option>',
								'<option>Semi-monthly</option>',
								'<option>Bi-weekly</option>',
								'<option>Weekly</option>',
							'</select>',
						'</fieldset>',

						'<button type="button" class="brd-button-submit brd-button-salary">Submit</button>',
					'</fieldset>',
				'</form>',
			'</div>'
		].join('')
	},
	stateMap = {
		$formTarget: undefined,
		validSalaryAmount: false,
		salary: undefined,
		salaryType: undefined,
		position: undefined
	},
	jqueryMap, setJqueryMap, initModule, setListeners,
	open, close, load, convertToMonthlySalary;

	setJqueryMap = function() {
		var $formTarget = stateMap.$formTarget;
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
			salaryType = stateMap.salaryType, newMonthlyIncome;
			if (amount && !isNaN(amount)) {
				newMonthlyIncome = convertToMonthlySalary(amount, salaryType);
				jqueryMap.$wrapper.hide();
				stateMap.salary = amount;
				stateMap.salaryType = salaryType;

				$.event.trigger('newsalary', [newMonthlyIncome, salaryType]);
				return true;
			}
			return false;
		});

		jqueryMap.$options.change(function() {
			var $form = $(this), type;
			type = $form.val();
			stateMap.salaryType = type;
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
		stateMap.position = 'open';

		jqueryMap.$amount.val(stateMap.salary);
		jqueryMap.$options.val(stateMap.salaryType);

	};

	close = function() {
		jqueryMap.$wrapper.hide();
		stateMap.position = 'closed';
	};

	initModule = function($formTarget, data) {
		$formTarget.append(configMap.html);
		stateMap.$formTarget = $formTarget;
		setJqueryMap();
		setListeners();
		close();

		stateMap.salary = data.salary;
		stateMap.salaryType = data.salaryType;
	};

	return {
		initModule: initModule,
		open: open,
		close: close
	};
	
}());