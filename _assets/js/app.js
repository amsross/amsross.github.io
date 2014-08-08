/*global $, _, JST*/
'use strict';

$(document).ready(function() {

	$.get('https://api.github.com/users/amsross/repos')
		.done(function(repos) {
			_.each(repos, function(repo) {
				$('.repos ul').append(JST['_assets/templates/repo.ejs'](repo));
			});
		});
});
