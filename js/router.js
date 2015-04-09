
var app = app || {};

(function() {
	console.log('router');
	var appRouter = Backbone.Router.extend({

		routes: {
			'*action' : 'defaultRoute'
		}, 
		defaultRoute: function (param) {
			//console.log('param=' + param);
		}
	
	});

	app.router = new appRouter();
	Backbone.history.start();

})();