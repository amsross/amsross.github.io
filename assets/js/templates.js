this["JST"] = this["JST"] || {};

this["JST"]["_assets/templates/repo.ejs"] = function(data) {
var __t, __p = '', __e = _.escape;
__p += '<li class=\'repo\'>\n\t' +
__e( data.fork ? 'fork' : 'source' ) +
': <a class=\'green\' href=\'' +
__e( data.html_url ) +
'\'>' +
__e( data.name ) +
'</a>\n</li>\n';
return __p
};