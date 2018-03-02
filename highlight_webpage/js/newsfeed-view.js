// anonymous, self-invoking function to limit scope
(function() {
  var NewsfeedView = {};

  /* Renders the newsfeed into the given $newsfeed element. */
  NewsfeedView.render = function($newsfeed) {
    // TODO
    PostModel.loadAll(function(error, values) {
      if (error) {
        $('.error').text(error)
      }
      values.forEach(function(value) {
        NewsfeedView.renderPost($newsfeed, value, false) 
      })
      $newsfeed.imagesLoaded(function() {
        $newsfeed.masonry({
          columnWidth: '.post',
          itemSelector: '.post'
        });
      });

    })
  };

  /* Given post information, renders a post element into $newsfeed. */
  NewsfeedView.renderPost = function($newsfeed, post, updateMasonry) {
    var postHtml = Templates.renderPost(post)
    var $wrappedPost = $(postHtml)
    $wrappedPost.find('.remove').bind('click', function(e) {
      PostModel.remove(post._id, function(error) {
        if (error) { $('.error').text(error) }
        else {
          $newsfeed.masonry('remove', $wrappedPost);
          $newsfeed.masonry();
        }
      })
    })
    $wrappedPost.find('.upvote').bind('click', function(e) {
      PostModel.upvote(post._id, function(error, updatedPost) {
        if (error) { $('.error').text(error) }
        else {
          $wrappedPost.find('.upvote-count').text(updatedPost.upvotes)
        }
      })
    })
    $newsfeed.prepend($wrappedPost)
    

    if (updateMasonry) {
      $newsfeed.imagesLoaded(function() {
        $newsfeed.masonry('prepended', $wrappedPost);
      });
    }
   
  };

  window.NewsfeedView = NewsfeedView;
})();
