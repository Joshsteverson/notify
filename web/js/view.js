
var app = app || {};

(function($) {
	'use strict';
	console.log('view');

	app.NotifyView = Backbone.View.extend({
		initialize: function(){
			var self = this;


		
			this.render();
		},
		getSearches: function() {
			app.searches = new app.GetSearches({emailaddress:this._email});

			console.log(app.searches);
			app.searches.save([], {
				success: function(a, b, c) {
					
					console.log('success');
					var html=$('#listbegin-template').html(),
						results = b;

					app.searchescollection = new Backbone.Collection();

					for(var s=0; s<results.length; s++) {
						var _s = new app.SavedSearch(results[s]);
						_s.set('id', _s.get('_id'));
						_s.set('pinned', (_s.get('pinned')||false));
						app.searchescollection.add(_s);

						html+=_.template($('#searcheslist-template').html(), {})(_s.attributes);
					}

					html+=$('#listend-template').html();
					$('#searcheslistcontainer').empty();
					$('#searcheslistcontainer').append(html);
					$('.pintrigger').bind('click touchstart', app.view.setPin);
					$('.deletesearch').bind('click touchstart', app.view.deleteSearch);
					console.log(app.searchescollection);
				},
				error: function(a, b, c) {
					console.log('error');
					console.log(a);
					console.log(b);
					console.log(c);
				}
			});
		},
		setPin: function(e) {
			e.preventDefault();
			var t = (e.target.tagName === 'SPAN' ? e.target.parentElement: e.target),
				results = _.where(app.searchescollection.models, {id:$(t).attr('searchid')}),
				pin = ($(t).attr('toggle')==='true'? true: false);

			if(results.length>0){
				results[0].set('pinned', pin);
				results[0].save([], {
					success: function(a, b, c) {
						console.log('success');
						app.view.getSearches();
					},
					error: function(a, b, c) {
						console.log('error');
						console.log(a);
						console.log(b);
						console.log(c);
					}
				});
			}

		},
		deleteSearch: function(e){
			e.preventDefault();
			var t = (e.target.tagName === 'SPAN' ? e.target.parentElement: e.target),
				results = _.where(app.searchescollection.models, {id:$(t).attr('searchid')});
				
			if(results.length>0){

				//unpin first. delete on second click.
				if( results[0].get('pinned') ) {
					app.view.setPin(e);
					return;
				}

				results[0].set('deletedoc', true);
				results[0].save([], {
					success: function(a, b, c) {
						console.log('success removed');
						app.view.getSearches();
					},
					error: function(a, b, c) {
						console.log('error removing');
						console.log(a);
						console.log(b);
						console.log(c);
					}
				});
			}
		},
		triggerSearch: function(e) {
			$('#artistname').popover('destroy');
			if(typeof this.searchTimer !== 'undefined')
				clearTimeout(this.searchTimer);

			if($('#artistname').val().length>1)
				this.searchTimer = setTimeout(app.view.autoSearch, 1000);
		},
		autoSearch: function() {
			var self = this;
			app.artistList = new app.ArtistList({q:$('#artistname').val(), type:'artist'});
			app.artistList.save([], {
				success: function(a, b, c) {
					
					console.log('success');
					var html=$('#listbegin-template').html(),
						results = JSON.parse(b.body);
					
					if(typeof results.artists === 'undefined')
						return;

					if(results.artists.items.length === 0)
						html+=$('#artistlistnoresults-template').html();

					for(var i=0; i<results.artists.items.length; i++) {
						var _a = results.artists.items[i];
						_a.artistdata = JSON.stringify(_a);
						html+=_.template($('#artistlist-template').html(), {})(_a);
					}

					html+=$('#listend-template').html();

					$('#artistname')
					.popover({
						selector: '[rel="popover"]',
						content: html,
						html: true,
						placement: 'bottom'
					})
					.popover('show');
					$('.searchresult').bind('click touchstart', app.view.setArtist);
				},
				error: function(a, b, c) {
					console.log('error');
					console.log(a);
					console.log(b);
					console.log(c);
				}
			});
		},
		setArtist: function(e) {
			var a = $(e.target).attr('artist');
			a = (a.length===0 ? false : JSON.parse(a));
			
			if(a) {
				console.log(a);
				app.artistList.set('_artist', a);
				console.log(app.artistList);
				$('#setartistinput').hide();
				$('#artistname').val(a.name);
				$('#setartistcontainer').empty();
				$('#setartistcontainer').append(_.template($('#setartist-template').html(), {})(a));
			}
		},
		resetArtist: function(e) {
			$('#setartistcontainer').empty();
			$('#setartistinput').show();
			//$('#setartistcontainer').append(_.template($('#setartist-template').html(), {})(a));
		},
		validatedForm: function(frm, evt){
			var data = {};
			$(document.body).unbind('click touchstart', app.view.popoverHandler);
			for(var i=0;i<frm.elements.length;i++){

				var e = frm.elements[i];
				if( !e.checkValidity() ) {
					$(e).popover({
						content:'this value is required or improperly formatted',
						title: 'required value',
						placement: 'bottom'
					});
					$(e).popover('show');
					e.focus();
					return false;
				}

				if(e.type==='radio' || e.type==='checkbox') {
					if(e.checked)
						data[e.name] = e.value;
				}else{
					data[e.id] = e.value;
				}
			}
			$(document.body).bind('click touchstart', app.view.popoverHandler);
			return data;

		},
		popoverHandler: function(e) {
			$('#artistname').popover('destroy');
		},
		beginSearches: function(e) {

			var data = app.view.validatedForm(frmemail, e);

			if(!data) {
				return;
			}

			localStorage.setItem('spNotify.email', $('#emailaddress').val());
			$('#addemail').modal('hide');
			app.view.render();

		},
		changeEmail: function(e) {
			e.preventDefault();
			
			$('#addemail').modal('show');
		},
		saveNewSearch: function(e) {
			var self = this,
				data = app.view.validatedForm(frmnewsearch, e);

			if(!data)
				return;
			
			data.pinned = (e.target.id === 'unpinnewsearch' ? false: true);
			data._spotifydata = app.artistList.get('_artist');
			data.emailaddress = app.view._email;

			console.log(data);

			app.saveNewSearch = new app.SaveNewSearch(data);
			app.saveNewSearch.save([], {
				success: function(a, b, c) {
					
					console.log('success');
					
				},
				error: function(a, b, c) {
					console.log('error');
					console.log(a);
					console.log(b);
					console.log(c);
				}
			});

			frmnewsearch.reset();
			app.view.resetArtist();
		},
		numericOnly: function (e) {
			// Allow: backspace, delete, tab, escape, enter and .
			if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
				// Allow: Ctrl+A
				(e.keyCode == 65 && e.ctrlKey === true) ||
				// Allow: home, end, left, right, down, up
				(e.keyCode >= 35 && e.keyCode <= 40)) {
					// let it happen, don't do anything
					return;
			}
			// Ensure that it is a number and stop the keypress
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}

		},
		render: function(){
			console.log('rendered');

			//localStorage.clear();
			if(localStorage.getItem('spNotify.email') === null){
				$('#addemail').modal('show');
				$('#beginsearches, #addemailaddress').bind('click touchstart', this.beginSearches);
			}else{
				this._email = localStorage.getItem('spNotify.email');
				this.getSearches();
				$('#emailaddress').val(this._email);
				$('#emaildisplay').text(this._email);
				$('#emaildisplay').bind('click touchstart', this.changeEmail);
				$('#artistname').bind('keyup', this.triggerSearch);
				$(document.body).bind('click touchstart', this.popoverHandler);
				$('#artistname').bind('click touchstart', this.popoverHandler);
				$('#manualsearch').bind('click touchstart', this.triggerSearch);
				$('#setartistcontainer').bind('click touchstart', this.resetArtist);
				$('.numsonly').bind('keydown', this.numericOnly);
				$('#pinnewsearch, #unpinnewsearch').bind('click touchstart', this.saveNewSearch);
				$('#beginsearches, #addemailaddress').bind('click touchstart', this.beginSearches);
			}

		}
	});

})($);