var brd = (function() {
	'use strict';
	var initModule = function($container) {
		var name;

		$.ajax({
			type: 'GET',
			url: '/user',
			success: function (data) {
				if (data.user) name = data.user;
				//currently using local model until connected is finished.
				brd.model.initModule(false);
				//Move shell init out of ajax call? Pass data in later?
				brd.shell.initModule($container, name);
			},
			error: function () {
				brd.model.initModule(false);
			}
		});

	};
	return {initModule: initModule};
}());