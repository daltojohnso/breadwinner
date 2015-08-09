var brd = (function() {
	'use strict';
	var initModule = function($container) {
		brd.model.initModule();
		brd.shell.initModule($container);
	};
	return {initModule: initModule};
}());