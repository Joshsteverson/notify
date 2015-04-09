
var app = app || {};

(function() {
	'use strict';
	console.log('models');

	app.NotifySearch = Backbone.Model.extend({
		url: 'NotifySearch'
	});

	app.ArtistList = Backbone.Model.extend({
		url: 'http://localhost:3000/ArtistList/'
	});

	app.SaveNewSearch = Backbone.Model.extend({
		url: 'http://localhost:3000/SaveNewSearch/'
	});
	
	app.GetSearches = Backbone.Model.extend({
		url: 'http://localhost:3000/GetSearches/'
	});

	app.SavedSearch = Backbone.Model.extend({
		url: 'http://localhost:3000/UpdateSearch/'
	});
})();