/*jshint esversion: 6 */
/*jshint node: true */

"use strict";

var request = require('request');
var OAuth = require('oauth');

var API_ROOT =  'https://disqus.com/api/3.0/%s.json';
var AUTHORIZE_URL = 'https://disqus.com/api/oauth/2.0/authorize';
var ACCESS_TOKEN_URL = 'https://disqus.com/api/oauth/2.0/access_token/';

var resourcesRequiringPost = ['blacklists/add', 'blacklists/remove', 'categories/create', 'exports/exportForum', 'forums/addModerator', 'forums/create', 'forums/removeModerator', 'posts/approve', 'posts/create', 'posts/highlight', 'posts/remove', 'posts/report', 'posts/restore', 'posts/spam', 'posts/unhighlight', 'posts/update', 'posts/vote', 'reactions/remove', 'reactions/restore', 'threads/close', 'threads/create', 'threads/open', 'threads/remove', 'threads/restore', 'threads/subscribe', 'threads/unsubscribe', 'threads/update', 'threads/vote', 'users/checkUsername', 'users/follow', 'users/unfollow', 'whitelists/add', 'whitelists/remove'];

// *********************************************************************** //
class Disqus {
  constructor(conf) {
    this.conf = conf;
    this.oauth2 = new OAuth.OAuth2(
      this.conf.api_key,
      this.conf.api_secret,
      '',
      AUTHORIZE_URL,
      ACCESS_TOKEN_URL
    );
    this.oauth2.useAuthorizationHeaderforGET(true);
  }
  
// *********************************************************************** //
  getHttpVerb(resource) {
    return resourcesRequiringPost.indexOf(resource) !== -1 ? 'post' : 'get';
  }
  
// *********************************************************************** //
  request(resource, qs, callback) {
    var method = this.getHttpVerb(resource);
    var url = API_ROOT.replace('%s', resource);
    Object.assign(qs, this.conf);
    
    return request[method]({ url, qs }, (e, res, body) => {
      callback(res.statusCode === 200 ? body : { error: { body, e, res } });
    });
  }

// *********************************************************************** //
  getAuthorizeUrl(type, uri, scope, state) {
    var url = this.oauth2.getAuthorizeUrl(
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

// *********************************************************************** //
  getOAuthAccessToken(code, uri, callback) {
    var self = this;
    this.oauth2.getOAuthAccessToken(code, {
          client_id: self.conf.api_key,
          client_secret: self.conf.api_secret,
          redirect_uri: uri,
          grant_type: 'authorization_code'
    }, (err, access_token, refresh_token, results) => {
      if (err) {
        return callback(err);
      } else {
        self.conf.access_token = access_token;
        return callback(null, access_token, refresh_token, results);
      }
    });
  }
  
// *********************************************************************** //
  refreshOAuthAccessToken(refreshtoken, callback) {
    var self = this;
    this.oauth2.getOAuthAccessToken(refreshtoken, {
          client_id: self.conf.api_key,
          client_secret: self.conf.api_secret,
          grant_type: 'refresh_token'
    }, (err, access_token, refresh_token, results) => {
      if (err) {
        return callback(err);
      } else {
        self.conf.access_token = access_token;
        return callback(null, access_token, refresh_token, results);
      }
    }); 
  }
}

module.exports = Disqus;
