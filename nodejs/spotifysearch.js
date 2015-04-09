(function(){
	
	exports.search = function(params){

		var request = require('request'),
			qs = require('querystring'),
			url = params.url+qs.stringify(params.query),
			searchHandler = function(e,r,b){
				console.log('a response');
				params.cb(r, params.resp);
			};

		request.get(url, searchHandler);
		
	};

})();