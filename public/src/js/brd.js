var brd = (function() {
	'use strict';
	var initModule = function($container) {
		$.get('/user', function(data) {
			var name;
			if (data.user) name = data.user;
			//currently using local model until db is finished.
			brd.model.initModule(false);
			brd.shell.initModule($container, name);

		});



		//brd.model.initModule();
		//brd.shell.initModule($container);
	};
	return {initModule: initModule};
}());