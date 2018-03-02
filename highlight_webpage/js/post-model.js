// anonymous, self-invoking function to limit scope
(function() {
  var PostModel = {};

  var POSTS_URL= '/posts';
  var STATUS_OK = 200

  /**
   * Loads all newsfeed posts from the server.
   *
   * Calls: callback(error, posts)
   *  error -- the error that occurred or null if no error occurred
   *  results -- an array of newsfeed posts
   */
  PostModel.loadAll = function(callback) {
    var postRequest = new XMLHttpRequest()

    postRequest.addEventListener('load', function() {
      if (postRequest.status === STATUS_OK) {
        var posts = JSON.parse(postRequest.responseText)
        callback(null, posts)
      } else {
        callback(postRequest.responseText)
      }
    })

    postRequest.open('GET', POSTS_URL)
    postRequest.send()
  };

  /* Adds the given post to the list of posts. The post must *not* have
   * an _id associated with it.
   *
   * Calls: callback(error, post)
   *  error -- the error that occurred or null if no error occurred
   *  post -- the post added, with an _id attribute
   */
  PostModel.add = function(post, callback) {
    var addPostRequest = new XMLHttpRequest()

    addPostRequest.addEventListener('load', function() {
      if (addPostRequest.status === STATUS_OK) {
        var newPost = JSON.parse(addPostRequest.responseText)
        callback(null, newPost)
      } else {
        callback(addPostRequest.responseText)
      }
    })

    addPostRequest.open('POST', POSTS_URL)
    addPostRequest.setRequestHeader('Content-type', 'application/json')
    addPostRequest.send(JSON.stringify(post))
  };

  /* Removes the post with the given id.
   *
   * Calls: callback(error)
   *  error -- the error that occurred or null if no error occurred
   */
  PostModel.remove = function(id, callback) {
    var removePostRequest = new XMLHttpRequest()

    removePostRequest.addEventListener('load', function() {
      if (removePostRequest.status === STATUS_OK) {
        callback(null)
      } else {
        callback(removePostRequest.responseText)
      }
    })

    removePostRequest.open('POST', POSTS_URL + '/remove')
    removePostRequest.setRequestHeader('Content-type', 'application/json')
    removePostRequest.send(JSON.stringify({id: id}))
  };

  /* Upvotes the post with the given id.
   *
   * Calls: callback(error, post)
   *  error -- the error that occurred or null if no error occurred
   *  post -- the updated post model
   */
  PostModel.upvote = function(id, callback) {
    var upvoteRequest = new XMLHttpRequest()

    upvoteRequest.addEventListener('load', function() {
      if (upvoteRequest.status === STATUS_OK) {
        callback(null, JSON.parse(upvoteRequest.responseText))
      } else {
        callback(upvoteRequest.responseText)
      }
    })

    upvoteRequest.open('POST', POSTS_URL + '/' + 'upvote')
    upvoteRequest.setRequestHeader('Content-type', 'application/json')
    upvoteRequest.send(JSON.stringify({id: id}))
  };

  window.PostModel = PostModel;
})();
