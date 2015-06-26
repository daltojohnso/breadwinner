brd.pay = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-pay">',
				'<div class="brd-pay-head">',
					'<button type="button" class="brd-form-exit">X</button>',
				'</div>',
				'<div class="brd-pay-main">',
					'<form class="pure-form pure-form-stacked brd-form brd-transaction-form" id="brd-transaction-form">',
						'<fieldset>',
							'<legend>Submit a new transaction</legend>',
							'<fieldset class="brd-radio-fieldset">',
								'<label for="brd-transaction-type-income" class="pure-radio">',
									'<input id="brd-transaction-type-income" class="brd-transaction-type" type="radio" name="transactionType" value="income">',
									'Income',
								'</label>',
								'<label for="brd-transaction-type-expense" class="pure-radio brd-transaction-type">',
									'<input id="brd-transaction-type-expense" class="brd-transaction-type" type="radio" name="transactionType" value="expense" checked>',
									'Expense',
								'</label>',
							'</fieldset>',
							'<label for="brd-transaction-name">Transaction Name</label>',
							'<input id="brd-transaction-name" placeholder="Transaction Name">',

							'<label for="brd-transaction-amt">Amount</label>',
							'<input id="brd-transaction-amt" class="brd-amt" placeholder="Amount">',

							'<label for="brd-transaction-date">Date</label>',
							'<input id="brd-transaction-date" class="brd-date" placeholder="Date">',

							//'<label for="brd-recurring" class="pure-checkbox">',
							//	'<input id="brd-recurring" type="checkbox" value="">',
							//	'Recurring',
							//'</label>',
							//'<label for="brd-recurring-options"></label>',
							//'<select id="brd-recurring-options" disabled>',
							//	'<option>Weekly</option>',
							//	'<option>Monthly</option>',
							//'</select>',

							'<button type="button" class="brd-transaction-button pure-button pure-button-primary">Submit</button>',
						'</fieldset>',
					'</form>',

					'<form class="pure-form pure-form-stacked brd-form brd-salary-form" id="brd-salary-form">',
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
									//'<option>Hourly</option>',
								'</select>',
								'<label for="brd-salary-hours"></label>',
								'<input id="brd-salary-hours" placeholder="Hours">',
							'</fieldset>',

							'<button type="button" class="brd-salary-button pure-button pure-button-primary">Update</button>',
						'</fieldset>',
					'</form>',
				'</div>',
				'<div class="brd-pay-data">',

				'</div>',
			'</div>'
		].join(''),
		numberRegex: /^\d+(?:\.\d{0,2})$/,
		dateFormat: 'DD-MM-YYYY'
	},
	stateMap = {
		$appendTarget: undefined,
		formOpen: undefined,
		transactionFormOpen: undefined,
		salaryFormOpen: undefined,
		radioValue: 'expense',
		position: 'closed',
		validTransactionDate: false,
		validTransactionAmount: false,
		validSalaryAmount: false,
		salary: undefined,
		salaryType: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap, validateAmount,
	open, close, setListeners, showForm, initForm, setPosition, resetForm, convertToMonthlySalary;
	
	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$payPanel: $appendTarget.find('.brd-pay-main'),
			$transactionType: $appendTarget.find('.brd-transaction-type'),
			$transactionName: $appendTarget.find('#brd-transaction-name'),
			$transactionAmt: $appendTarget.find('#brd-transaction-amt'),
			$transactionDate: $appendTarget.find('#brd-transaction-date'),
			$amountFields: $appendTarget.find('.brd-amt'),
			$dateFields: $appendTarget.find('.brd-date'),
			$submit: $appendTarget.find('.brd-transaction-button'),
			$update: $appendTarget.find('.brd-salary-button'),
			$newMonthlyIncome: $appendTarget.find('#brd-salary-amt'),
			$headerList: $appendTarget.find('.brd-head-tabs li'),

			$forms: $appendTarget.find('.brd-form'),
			$transactionForm: $appendTarget.find('.brd-transaction-form'),
			//$incomeForm: $appendTarget.find('.brd-income-form'),
			$salaryForm: $appendTarget.find('.brd-salary-form'),
			$formExit: $appendTarget.find('.brd-form-exit'),
			$formsDiv: $appendTarget.find('.brd-pay'),
			$salaryType: $appendTarget.find('#brd-salary-options'),
			$hourlyForm: $appendTarget.find('#brd-salary-hours'),
			$salaryAmount: $appendTarget.find('#brd-salary-amt')
		};
	};

	open = function() {
		jqueryMap.$payPanel.show();
	};
	
	close = function() {
		jqueryMap.$payPanel.close();
	};

	showForm = function(form, date) {
		jqueryMap.$formsDiv.show();
		jqueryMap.$forms.hide();
		if (form === 'transaction') {
			jqueryMap.$transactionForm.show();
			if (date) {
				jqueryMap.$transactionDate.val(date);
			}
		//} else if (form === 'income') {
		//	jqueryMap.$incomeForm.show();
		} else if (form === 'salary') {
			jqueryMap.$salaryForm.show();
			jqueryMap.$salaryAmount.val(stateMap.salary);
			jqueryMap.$salaryType.val(stateMap.salaryType);

		} else {
			return false;
		}
	};
	
	validateAmount = function(amount) {
		//update the regex
		//return configMap.numberRegex.test(amount);
	};

	resetForm = function(form) {
		if (form === 'transaction') {

		}
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
	
	setListeners = function() {
		jqueryMap.$submit.click(function() {
			var amount = +jqueryMap.$transactionAmt.val(),
			name = jqueryMap.$transactionName.val(),
			date = jqueryMap.$transactionDate.val(), dateMoment;
			dateMoment = moment(date, configMap.dateFormat);
			if (amount > 0 && !isNaN(amount) && dateMoment.isValid()) {
				$.event.trigger('transaction', [name, amount, date, stateMap.radioValue]);
				jqueryMap.$transactionAmt.val('');
				jqueryMap.$transactionName.val('');
				jqueryMap.$transactionDate.val(moment().format('DD-MM-YYYY').valueOf());
				jqueryMap.$transactionType.last().prop('checked', true);
				stateMap.radioValue = 'expense';
				jqueryMap.$formsDiv.hide();
				return true;
			}
			return false;
		});
		
		//repeating too much code...
		jqueryMap.$update.click(function() {
			var amount = +jqueryMap.$newMonthlyIncome.val(),
			salaryType = stateMap.salaryType, newMonthlyIncome;
			if (amount && !isNaN(amount)) {
				newMonthlyIncome = convertToMonthlySalary(amount, salaryType);
				jqueryMap.$formsDiv.hide();
				stateMap.salary = amount;
				stateMap.salaryType = salaryType;

				$.event.trigger('salaryupdate', [newMonthlyIncome, salaryType]);
				return true;
			}
			return false;
		});
		
		jqueryMap.$amountFields.keyup(function() {
			var $form = $(this);
			var amount = +$form.val();
			if (window.isNaN(amount) || amount < 0) {
				$form.addClass('brd-validation-fail');
			} else {
				$form.removeClass('brd-validation-fail');
			}
		});

		jqueryMap.$dateFields.keyup(function() {
			var $form = $(this);
			var date = moment($form.val());
			if (date.isValid()) {
				$form.removeClass('brd-validation-fail');
			} else {
				$form.addClass('brd-validation-fail');
			}
		});
		
		/*jqueryMap.$headerList.click(function() {
			if ($(this).hasClass('brd-tab-inactive')) {
				$('.brd-head-tabs li').addClass('brd-tab-inactive');
				$(this).removeClass('brd-tab-inactive');
			}
			
			if (this.id === 'brd-tab-income') {
				$('.brd-form').hide();
				$('.brd-monthly-income').show();
			} else if (this.id === 'brd-tab-expense') {
				$('.brd-form').hide();
				$('.brd-expense-form').show();
				
			}
		});*/

		jqueryMap.$salaryType.change(function() {
			var $form = $(this), type;
			type = $form.val();
			stateMap.salaryType = type;
			if (type === 'Hourly') {
				jqueryMap.$hourlyForm.show();
			} else {
				jqueryMap.$hourlyForm.hide();
			}
		});

		jqueryMap.$formExit.click(function() {
			jqueryMap.$formsDiv.hide();
		});

		jqueryMap.$transactionType.click(function() {
    		stateMap.radioValue = $(this).val();
		});

		/*$('body').click(function() {
			jqueryMap.$formsDiv.hide();
		});

		$('.brd-pay, .brd-buttons-main, .fc-body, button').click(function(event) {
			event.stopPropagation();
		});*/
	};

	initForm = function() {
		//eventualy wanna pass in a boolean to see whether the user has added a salary to set it to the appropriate form on start.
		
		$('.brd-form').hide();
		$('.brd-salary-form').show();
		//$('.brd-pay').hide();
		//stateMap.formOpen = false;
		//stateMap.transactionFormOpen = false;
		//stateMap.salaryFormOpen = true;
	};

	setPosition = function(position, callback) {
		var height, speed;
		if (stateMap.position === position) {
			return true;
		}

		if (position === 'opened') {
			height = '438px';
			speed = 100;
		} else if (position === 'closed') {
			speed = 100;
			height = 0;
		} else {
			return false;
		}

	//	jqueryMap.$formsDiv.animate(
	//		height: height,
	//		speed);
		return true;

	};
	
	initModule = function($appendTarget, salaryData) {
		var calendar1;
		$appendTarget.append(configMap.mainHtml);
		stateMap.$appendTarget = $appendTarget;
		setJqueryMap();
		setListeners();
		initForm();

		calendar1 = document.getElementById('brd-expense-date');
		//calendar2 = document.getElementById('brd-date-input_02');
		rome(document.getElementById('brd-transaction-date'), { time: false, inputFormat: 'DD-MM-YYYY' });
	//rome(document.getElementById('brd-income-date'), { time: false, inputFormat: 'DD MM YYYY'});
		jqueryMap.$transactionDate.val(moment().format('DD-MM-YYYY').valueOf());
	//	$('.brd-income-date').val(moment().format('DD MM YYYY').valueOf());

		//want a +/- option for transactions
		//a multiplier?
		//recurring transactions!


		jqueryMap.$hourlyForm.hide();
		jqueryMap.$formsDiv.hide();


		stateMap.salary = salaryData.salary;
		stateMap.salaryType = salaryData.salaryType;
		
	};
	
	return {
		initModule: initModule,
		open: open,
		close: close,
		showForm: showForm,
		setPosition: setPosition
	};
}());