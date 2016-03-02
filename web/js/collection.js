
var app = app || {};

(function() {
	'use strict';
	console.log('collection');

	app.NotifySearches = Backbone.Collection.extend({
		url: 'NotifySearches',
		model: app.NotifySearch,
		comparator:'id'
	});
	
})();