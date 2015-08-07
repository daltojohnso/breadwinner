brd.buttons = (function() {
	'use strict';
	var configMap = {
	},
	stateMap = {
		$appendTarget: undefined
	},
	jqueryMap = {},
	initModule, setJqueryMap;

	setJqueryMap = function() {
		var $appendTarget = stateMap.$appendTarget;
		jqueryMap = {
			$appendTarget: $appendTarget,
			$transactionLink: $appendTarget.find('.brd-link-transaction'),
			$salaryLink: $appendTarget.find('.brd-link-salary')
		}
	}

	initModule = function($appendTarget) {
		stateMap.$appendTarget = $appendTarget;
		$appendTarget.html(brd.templates.buttons);
		setJqueryMap();

		jqueryMap.$transactionLink.click(function(event) {
			$.event.trigger('transactionbuttonclick');
		});
		jqueryMap.$salaryLink.click(function(event) {
			$.event.trigger('salarybuttonclick');
		});
	};

	return {
		initModule: initModule
	};

}());