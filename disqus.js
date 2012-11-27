var _ = require('underscore');
var util = require('util');
var request = require('request');
var querystring = require('querystring');

// These methods require POST instead of GET
var resourcesRequiringPost = [
    'blacklists/add',
    'blacklists/remove',
    'categories/create',
    'exports/exportForum',
    'forums/addModerator',
    'forums/create',
    'forums/removeModerator',
    'posts/approve',
    'posts/create',
    'posts/highlight',
    'posts/remove',
    'posts/report',
    'posts/restore',
    'posts/spam',
    'posts/unhighlight',
    'posts/update',
    'posts/vote',
    'reactions/remove',
    'reactions/restore',
    'threads/close',
    'threads/create',
    'threads/open',
    'threads/remove',
    'threads/restore',
    'threads/subscribe',
    'threads/unsubscribe',
    'threads/update',
    'threads/vote',
    'users/checkUsername',
    'users/follow',
    'users/unfollow',
    'whitelists/add',
    'whitelists/remove'
];

function Disqus( conf ) {
    this.access_token = conf.access_token;
    this.api_key = conf.api_key;
    this.api_secret = conf.api_secret;
}

Disqus.prototype = {
    API_ROOT : 'https://disqus.com/api/3.0/%s.json',

    _getHttpVerb : function(resource) {
        return resourcesRequiringPost.indexOf(resource) !== -1 ? 'post' : 'get';
    },

    _handleResponse : function(error, response, body, callback) {
        if (response.statusCode === 200) {
            return body;
        } else {
            return {
                error : {
                    body : body,
                    error : error,
                    response : response
                }
            };
        }
    },

    getRequestUrl : function(resource, params) {
        params = params || {};

        resource = resource.toLowerCase();

        // Always extend with the authentication stuff
        _.extend(params, {
            api_secret : this.api_secret,
            api_key : this.api_key,
            access_token : this.access_token
        });

        var url = util.format(this.API_ROOT, resource);
        url += '?' + querystring.stringify( params );

        return url;
    },

    request : function(resource, params, callback ) {
        params = params || {};

        var method = this._getHttpVerb(resource);

        if (method === 'get') {
            url = this.getRequestUrl(resource, params);

            request.get(url, function() {
                callback( this._handleResponse.apply(this, arguments) );
            }.bind(this));
        }

        if (method === 'post') {
            url = this.getRequestUrl(resource);

            request.post({
                url : url,
                body : querystring.stringify( params )
            }, function() {
                callback( this._handleResponse.apply(this, arguments) );
            }.bind(this));
        }
    }
};

module.exports = Disqus;