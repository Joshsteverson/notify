
var app = app || {};

(function() {
	'use strict';
	console.log('models');

	app.NotifySearch = Backbone.Model.extend({
		url: 'NotifySearch'
	});

	app.ArtistList = Backbone.Model.extend({
		url: 'ArtistList/'
	});

	app.SaveNewSearch = Backbone.Model.extend({
		url: 'SaveNewSearch/'
	});
	
	app.GetSearches = Backbone.Model.extend({
		url: 'GetSearches/'
	});

	app.SavedSearch = Backbone.Model.extend({
		url: 'UpdateSearch/'
	});
})();