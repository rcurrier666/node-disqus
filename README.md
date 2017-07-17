# Disqus - An API module for Node.js

This module allows you to use the [Disqus API](http://disqus.com/api/docs/). The module is written for version 3.0 of the API and uses the 'Legacy admin authentication' as well as providing OAuth functions.

## Install

    npm install disqus

## Use

### Setup

Here's how to set it up:

    var Disqus = require('disqus');

    var disqus = new Disqus({
        api_secret : 'your_api_secret',
        api_key : 'your_api_key',
        access_token : 'your_access_token'  // Optional
    });

From then on you can use the `request` method to make calls to the API. Note that the module knows if it should use GET or POST, so you don't need to worry about that. If you are going to be using OAuth to authenticate you should ommit `access_token`. If you've already obtained a token either through Legacy authentication or previous calls to OAuth you must provide the `access_token` here. Note that the `access_token` from the Disqus Developer admin page can only be used to authenticate the developer account owner, you must use OAuth methods below to obtain a token for your users.

### Request method

The `request` method has three parameters:

    disqus.request(resource, parameters, callback);

* `resource` maps to one of the API methods, so for example the [list method for posts](http://disqus.com/api/docs/posts/list/) is written as `posts/list` in the argument.

* `parameters` are required but can be an empty object (`{}`) if you don't have any.

* `callback` will contain either the response of the call if it was successful. If you got an error, it will contain an `error` property with error information.

#### Example

Here's an example that will list all posts from a forum called 'foo'. This example requires that the `disqus` object is already setup with your credentials, as shown in the 'setup' example above.

    disqus.request('posts/list', { forum : 'foo'}, function(data) {
        if (data.error) {
            console.error('Something went wrong...', err);
        } else {
            console.log(data);
        }
    });

### OAuth authentication methods

These three methods implement the server side of the standard OAuth2 three legged authentication flow. See [here](http://oauthbible.com/#oauth-2-three-legged) for a good discussion of how this works in general and [here](https://disqus.com/api/docs/auth/) for an incomplete discussion on how Disqus implements it.

#### getAuthorizationUrl

The `getAuthorizationUrl` has four parameters:

    url = disqus.getAuthorizationUrl(type, uri, scope, state);

* `type` is the response type requested from the call and should be `'code'` in most cases.

* `uri` is the redirect_uri where the code will be returned after the user has confirmed their acceptance of the request. Unlike many other services that support OAuth, the redirect_uri must match **exactly** the uri listed on your Disqus admin page. No query string is allowed, use `state` below to pass data through the call.

* `scope` is a string with comma seperated scopes that are being requested. Possible scopes are read, write, and email.

* `state` is an optional state string that will be passed back when the redirect_uri is called. This is intended to be used to verify that the uri callback is legitimate but may be used to pass any string through that you need in the callback (the user's accountId for instance).

* `url` is the returned url that should be passed back to the ciient for rendering to the user.

#### Example

    var url = disqus.getAuthorizationUrl('code', 'https://example.com/callbacks/disqus', 'read,write', this.userId);

#### getOAuthAccessToken

Exchange the code received from Disqus for an OAuth access token. The `getOAuthAccessToken` method has 3 parameters:

``` javascript
getOAuthAccessToken(code, uri, callback);
```

* `code` is the code returned by `getAuthorizationUrl` in the query string.

* `uri` is the redirect_uri listed on your Disqus Developer admin page. The redirect_uri will not be called, but must be provided.

* `callback` will contain either the response of the call if it was successful. If you got an error, it will contain an error property with error information. If successful, the access_token will also be stored in the disqus object for use by the `request` method.

#### Example

``` javascript
disqus.getOAuthAccessToken(params.query.code, URI, (err, access_token, refresh_token, results) => {
     if (err) {
         console.err('Something went wrong...', err);
     } else {
         console.log(access_token, refresh_token, results);
     }
});
```

#### refreshOAuthAccessToken

Get a new OAuth access token when the old one expires. The `refreshOAuthAccessToken` has 2 parameters:

``` javascript
refreshOAuthAccessToken(refresh_token, callback);
```

* `refresh_token` is the refresh_token returned by getOAuthAccessToken.

* `callback` will contain either the response of the call if it was successful. If you got an error, it will contain an error property with error information. If successful you will get a new `access_token` and `refresh_token` and the `access_token` in the disqus object will be updated.

#### Example

``` javascript
 disqus.refreshOAuthAccessToken(refreshtoken, (err, new_access_token, new_refresh_token, results) => {
     if (err) {
         console.err('Something went wrong...', err);
     } else {
         console.log(new_access_token, new_refresh_token, results);
     }
});
```

## Notes
* This module is relased under the terms of the [MIT license](http://opensource.org/licenses/MIT).
* [Source on Github](http://github.com/rcurrier666/node-disqus)
* Written by [Hay Kranen](http://www.haykranen.nl)
* [Follow me on Twitter](http://twitter.com/hayify)
* OAuth support written by Ron Currier
