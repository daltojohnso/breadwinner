var brd = (function() {
	'use strict';
	var initModule = function($container) {
		$.get('/user', function(data) {
			var name;
			if (data.user) name = data.user;

			brd.model.initModule();
			brd.shell.initModule($container, name);

		});



		//brd.model.initModule();
		//brd.shell.initModule($container);
	};
	return {initModule: initModule};
}());