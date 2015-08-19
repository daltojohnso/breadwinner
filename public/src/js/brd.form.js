brd.form = (function() {
	'use strict';
	var state = {
		$appendTarget: undefined,
		formOpen: undefined,
		child: undefined
	},
	initModule, jqueryMap, setJqueryMap, setListeners,
	open, close, show, load;

	setJqueryMap = function() {
		var $appendTarget = state.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$form: $appendTarget.find('.brd-form'),
			$exitButton: $appendTarget.find('.brd-form-exit'),
			$formTarget: $appendTarget.find('.brd-form-target'),
			$formData: $appendTarget.find('.brd-form-data')
		};
	};

	setListeners = function() {
		jqueryMap.$exitButton.click(function() {
			close();
		});

		$(document).on('transaction', function(event) {
			//close();
		})
		.on('newsalary', function(event) {
			//close();
		});

	};

	load = function(child, data) {
		if (state.child === child) {
			brd.form[child].load(data);
		}
	};

	open = function() {
		jqueryMap.$form.css('display', 'block');
		jqueryMap.$form.animate({opacity: 1, bottom: '85px'}, 'fast');
		state.formOpen = true;
	};
	
	close = function() {
		jqueryMap.$form.animate({opacity: 0, bottom: '85px'}, 'fast', function() {
			jqueryMap.$form.css('display', 'none');
			if (state.child)
				brd.form[state.child].close();
			state.child = null;
		});
		state.formOpen = false;
	};

	show = function(child, data) {
		if (!brd.form[child]) 
			return false;
		if (state.child) {
			brd.form[state.child].close();
			brd.form[child].open(data);
		} else {
			open();
			brd.form[child].open(data);
		}
		state.child = child;
		return true;
	};

	initModule = function($appendTarget, salaryData) {
		$appendTarget.append(brd.templates.form);
		state.$appendTarget = $appendTarget;
		setJqueryMap();
		setListeners();

		brd.form.transaction.initModule(jqueryMap.$formTarget);
		brd.form.salary.initModule(jqueryMap.$formTarget, salaryData);
		brd.form.day.initModule(jqueryMap.$formTarget);

		$.event.trigger(brd.event.dayClick, [moment()]);
	};

	return {
		initModule: initModule,
		open: open,
		close: close,
		show: show,
		load: load
	};
}());