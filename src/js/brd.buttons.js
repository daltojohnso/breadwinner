brd.buttons = (function() {
	'use strict';
	var configMap = {
		mainHtml: [
			'<div class="brd-buttons-main">',
				'<ul>',
					'<li class="brd-buttons-expense">',
						'<a href="#" class="brd-link-transaction pure-button">+</a>',
					'</li>',
					'<li class="brd-buttons-salary">',	
						'<a href="#" class="brd-link-salary pure-button">Salary</a>',
					'</li>',
				'</ul>',
			'</div>'
		].join('')
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
		$appendTarget.html(configMap.mainHtml);
		setJqueryMap();

		jqueryMap.$transactionLink.click(function(event) {
			$.event.trigger('transactionLinkClick');
		});
		jqueryMap.$salaryLink.click(function(event) {
			$.event.trigger('salaryLinkClick');
		});
	};

	return {
		initModule: initModule
	};

}());