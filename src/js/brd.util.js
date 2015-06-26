brd.util = (function() {
	var makeError, setConfigMap;

	makeError = function(nameText, msgText, data) {
		var error = new Error();
		error.name = nameText;
		error.message = msgText;
		if (data) {
			error.data = data;
		}
		return error;
	};

	setConfigMap = function(argMap) {
		var inputMap = argMap.inputMap,
		settableMap = argMap.settableMap,
		configMap = argMap.configMap,
		keyName,
		error;

		for (keyName in inputMap) {
			if (inputMap.hasOwnProperty(keyName)) {
				if (settableMap.hasOwnProperty(keyName)) {
					configMap[keyName] = inputMap[keyName];
				} else {
					error = makeError('Bad Input',
					 'Setting config key |' + keyName + '| is not supported');
					throw error;
				}
			}
		}
	};

	return {
		makeError: makeError,
		setConfigMap: setConfigMap
	};
}());