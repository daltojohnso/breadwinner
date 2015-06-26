brd.util_b = (function() {
	'use strict';
	var configMap = {
		regexEncodeHtml: /[&"'><]/g,
		regexEncodeNoAmp: /["'><]/g,
		htmlEncodeMap: {
			'&': '&#38;',
			'"': '&#34;',
			"'": '&#39;',
			'>': '&#62;',
			'<': '&#60;'
		}
	},
	decodeHtml,
	encodeHtml,
	getEmSize;

	configMap.regexEncodeNoAmpMap = $.extend({}, configMap.htmlEncodeMap);
	delete configMap.regexEncodeNoAmpMap['&'];

	decodeHtml = function(str) {
		return $('<div/>').html(str || '').text();
	};

	encodeHtml = function(inputArgStr, excludeMap) {
		var inputStr = String(inputArgStr),
		regex, lookupMap;

		if (excludeMap) {
			lookupMap = configMap.regexEncodeNoAmpMap;
			regex = configMap.regexEncodeNoAmp;
		} else {
			lookupMap = configMap.htmlEncodeMap;
			regex = configMap.regexEncodeHtml;
		}
		return inputStr.replace(regex, function(match, name) {
			return lookupMap[match] || '';
		});
	};

	getEmSize = function(elem) {
		return Number(getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/) [0]);
	};

	return {
		decodeHtml: decodeHtml,
		encodeHtml: encodeHtml,
		getEmSize: getEmSize
	};
}());