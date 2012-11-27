# Disqus - An API module for Node.js

This module allows you to use the [Disqus API](http://disqus.com/api/docs/). The module is written for version 3.0 of the API and uses the 'Legacy admin authentication' instead of OAuth.

## Install

    npm install disqus

## Use

### Setup

Here's how to set it up:

    var Disqus = require('disqus');

    var disqus = new Disqus({
        api_secret : 'your_api_secret',
        api_key : 'your_api_key',
        access_token : 'your_access_token'
    });

From then on you can use the `request` method to make calls to the API. Note that the module knows if it should use GET or POST, so you don't need to worry about that.

### Request method

The `request` method has three parameters:

    disqus.request(resource, parameters, callback);

`resource` maps to one of the API methods, so for example the [list method for posts](http://disqus.com/api/docs/posts/list/) is written as `posts/list` in the argument.

`parameters` are required but can an empty object (`{}`) if you don't have any.

`callback` will contain either the response of the call if it went successful. If you got an error, it will contain an `error` property with error information.

### Example

Here's an example that will list all posts from a forum called 'foo'. This example requires that the `disqus` object is already setup with your credentials, as shown in the 'setup' example above.

    disqus.request('posts/list', { forum : 'foo'}, function(data) {
        if (data.error) {
            console.log('Something went wrong...');
        } else {
            console.log(data);
        }
    });

## Notes
* This module is relased under the terms of the [MIT license](http://opensource.org/licenses/MIT).
* [Source on Github](http://github.com/hay/node-disqus)
* Written by [Hay Kranen](http://www.haykranen.nl)
* [Follow me on Twitter](http://twitter.com/hayify)