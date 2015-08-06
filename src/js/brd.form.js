brd.form = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-form">',
				'<div class="brd-form-head">',
					'<button type="button" class="brd-form-exit">X</button>',
				'</div>',
				'<div class="brd-form-target">',

				'</div>',
				'<div class="brd-form-data">',

				'</div>',
			'</div>'

		].join('')
	},
	stateMap = {
		$appendTarget: undefined,
		formOpen: undefined,
		child: undefined
	},
	initModule, jqueryMap, setJqueryMap, setListeners,
	open, close, show, load;

	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
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
			close();
		})
		.on('newsalary', function(event) {
			close();
		});

	};

	load = function(child, data) {
		if (stateMap.child === child) {
			brd.form[child].load(data);
		}
	};

	open = function() {
		jqueryMap.$form.css('display', 'block');
		jqueryMap.$form.animate({opacity: 1, bottom: '95px'}, 'fast');
		stateMap.formOpen = true;
	};
	
	close = function() {
		jqueryMap.$form.animate({opacity: 0, bottom: '85px'}, 'fast', function() {
			jqueryMap.$form.css('display', 'none');
			if (stateMap.child)
				brd.form[stateMap.child].close();
			stateMap.child = null;
		});
		stateMap.formOpen = false;
	};

	show = function(child, data) {
		if (!brd.form[child]) 
			return false;
		if (stateMap.child) {
			brd.form[stateMap.child].close();
			brd.form[child].open(data);
		} else {
			open();
			brd.form[child].open(data);
		}
		stateMap.child = child;
		return true;
	};

	initModule = function($appendTarget, salaryData) {
		$appendTarget.append(configMap.mainHtml);
		stateMap.$appendTarget = $appendTarget;
		setJqueryMap();
		setListeners();

		brd.form.transaction.initModule(jqueryMap.$formTarget);
		brd.form.salary.initModule(jqueryMap.$formTarget, salaryData);
		brd.form.day.initModule(jqueryMap.$formTarget);
		
		close();
	};

	return {
		initModule: initModule,
		open: open,
		close: close,
		show: show,
		load: load
	};
}());