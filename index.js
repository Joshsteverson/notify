(function(){
	'use strict';

	var express = require('express'),
		app = express(),
		bodyParser = require('body-parser'),
		data = [],
		artistListHandler = function(req, resp){
			
			console.log('artistListHandler'+req.method);
			var spotify = require('./spotifysearch'),
				cb = function(r, resp) {
					resp.send(r);
				},
				params = {
					query:req.body,
					cb: cb,
					resp: resp,
					url: 'https://api.spotify.com/v1/search?'
				};

			spotify.search(params);

		},
		saveSearchHandler = function(req, resp) {
			console.log('saveSearchHandler'+req.method);
		
			var mongodb = require('mongodb'),
				ObjectID = require('mongodb').ObjectID;

			mongodb.connect('mongodb://localhost:27017/test2', function(err, db) {
				if(!err) {
					var searches = db.collection('savedSearches');
					
					if(typeof req.body._id === 'undefined'){
						searches.insert(req.body);
						db.close();
					}else{
						var query = {_id: new ObjectID(req.body._id)};

						delete req.body._id;
						
						if(typeof req.body.deletedoc !== 'undefined'){
							searches.remove(query);
							db.close();
							resp.send({});
						}else{
							searches.update(
								query,
								req.body,
								function(err, object) {
									if (err){
										console.warn('Error:'+err.message);
										db.close();
										resp.send({dbmessage:err.message});
									}else{
										db.close();
										resp.send({dbmessage:'success'});
									}
								});
							
						}

					}
				}

			});
			
		},
		getSearchesHandler = function(req, resp) {
			console.log('saveSearchHandler'+req.method);
			
			var mongodb = require('mongodb');

			mongodb.connect('mongodb://localhost:27017/test2', function(err, db) {
				if(!err) {
					
					var query = {emailaddress:req.body.emailaddress},
						searches = db.collection('savedSearches').find(query);
					searches.each(function(err, item) {
						if(item === null) {
							db.close();
							resp.send(data);
							data = [];
						}else{
							data.push(item);
						}
					});

				}
			});

		};

	app.use(bodyParser.json());		// to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({	// to support URL-encoded bodies
		extended: true
	}));
	app.use(express.static('web'));
	
	app.all('/*', function(req, res, next) {
		console.log(req.method);
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		next();
	});
	
	app.post('/GetSearches', getSearchesHandler);
	app.post('/SaveNewSearch', saveSearchHandler);
	app.put('/UpdateSearch', saveSearchHandler);
	app.post('/UpdateSearch', saveSearchHandler);
	app.post('/ArtistList', artistListHandler);

	app.listen(3003, function () {

		var host = this.address().address,
			port = this.address().port;

		console.log('Listening -- %s:%s', host, port);

	});

})();