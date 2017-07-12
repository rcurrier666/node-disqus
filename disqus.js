/*jshint esversion: 6 */
"use strict";

var request = require('request')
var API_ROOT =  'https://disqus.com/api/3.0/%s.json'
var OAUTH2_ROOT = 'https://disqus.com/api/oauth/2.0/authorize/'

var resourcesRequiringPost = ['blacklists/add', 'blacklists/remove', 'categories/create', 'exports/exportForum', 'forums/addModerator', 'forums/create', 'forums/removeModerator', 'posts/approve', 'posts/create', 'posts/highlight', 'posts/remove', 'posts/report', 'posts/restore', 'posts/spam', 'posts/unhighlight', 'posts/update', 'posts/vote', 'reactions/remove', 'reactions/restore', 'threads/close', 'threads/create', 'threads/open', 'threads/remove', 'threads/restore', 'threads/subscribe', 'threads/unsubscribe', 'threads/update', 'threads/vote', 'users/checkUsername', 'users/follow', 'users/unfollow', 'whitelists/add', 'whitelists/remove']

class Disqus {
  constructor(conf) {
    this.conf = conf
  }
  
  getHttpVerb(resource) {
    return resourcesRequiringPost.indexOf(resource) !== -1 ? 'post' : 'get';
  }
  
  request(resource, qs, callback) {
    var method = this.getHttpVerb(resource)
    var url = API_ROOT.replace('%s', resource)
    Object.assign(qs, this.conf)
    
    return request[method]({ url, qs }, (e, res, body) => {
      callback(res.statusCode === 200 ? body : { error: { body, e, res } })
    })
  }

  getAuthorizeUrl(type, uri, scope, state) {
    var OAuth = require('oauth');
    var OAuth2 = OAuth.OAuth2;

    var oauth = new OAuth2(
        this.conf.api_key,
        this.conf.api_secret,
        null,
        OAUTH2_ROOT,
        null);
    oauth.useAuthorizationHeaderforGET(true);
    var url = oauth.getAuthorizeUrl(
        {response_type: type,
         redirect_uri: uri,
         scope: scope,
         state: state
        });
    // There is a bug somewhere in either the Disqus OAuth code or the OAuth NPM
    // that prepends "NULL" to the front of the URL. So we strip it off before returning it
    var pos = url.indexOf("https:");
    url = url.slice(pos);
    return url;
  }
}

module.exports = Disqus;
