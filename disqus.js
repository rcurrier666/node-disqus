var request = require('request')
var API_ROOT =  'https://disqus.com/api/3.0/%s.json'

var resourcesRequiringPost = ['blacklists/add', 'blacklists/remove', 'categories/create', 'exports/exportForum', 'forums/addModerator', 'forums/create', 'forums/removeModerator', 'posts/approve', 'posts/create', 'posts/highlight', 'posts/remove', 'posts/report', 'posts/restore', 'posts/spam', 'posts/unhighlight', 'posts/update', 'posts/vote', 'reactions/remove', 'reactions/restore', 'threads/close', 'threads/create', 'threads/open', 'threads/remove', 'threads/restore', 'threads/subscribe', 'threads/unsubscribe', 'threads/update', 'threads/vote', 'users/checkUsername', 'users/follow', 'users/unfollow', 'whitelists/add', 'whitelists/remove']

module.exports = class Disqus {
  constructor(conf) {
    this.conf = conf
  }
  
  getHttpVerb(resource) {
    return resourcesRequiringPost.indexOf(resource) !== -1 ? 'post' : 'get';
  }
  
  request(resource, qs = {}, callback) {
    var method = this.getHttpVerb(resource)
    var url = API_ROOT.replace('%s', resource)
    Object.assign(qs, this.conf)
    
    return request[method]({ url, qs }, (e, res, body) => {
      callback(res.statusCode === 200 ? body : { error: { body, e, res } })
    })
  }
}
