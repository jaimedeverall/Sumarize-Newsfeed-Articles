var storyOptions = new Set();

function addFeatures(){
  $("a[aria-label='Story options'").each(function(index, element){
    if(isElementInViewport(element)){
      var position = $(element).offset();
      //storyOptions.add(element)
        //var globalContainerRect = globalContainer.getBoundingClientRect();
      //var elemRect = element.getBoundingClientRect()
        // var y= elemRect.top - globalContainerRect.top;
        // var x = elemRect.left - globalContainerRect.left;
      var expandButton = createExpandButton();
      //document.getElementById("globalContainer").appendChild(expandButton);
      document.body.appendChild(expandButton);
      $(expandButton).css(position);
    }
      // if(!storyOptions.has(element)){
      
      // }
  })
}

$(window).scroll(function() {
    $('.expand_button').remove()
    clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(addFeatures, 250));
});

$(window).click(function(){
  $('.expand_button').remove();
  clearTimeout($.data(this, 'scrollTimer'));
})

function createExpandButton(){
  var expandButton = document.createElement('input');
  var url = chrome.runtime.getURL('images/expandButton.png')
  expandButton.setAttribute('type', 'image');
  expandButton.setAttribute('src', url);
  expandButton.setAttribute('class', 'expand_button');
  return expandButton
}

function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&/*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

// Mouse listener for any move event on the current document.
// document.addEventListener('mousemove', function (e) {
//   var srcElement = e.srcElement;
//   var link = null;
//   if(link == null && srcElement.nodeName == 'A' && isNews(srcElement.href)){
//     link = srcElement
//     var selection = "Hi this is a test"//window.getSelection().toString();
//     renderBubble(e.clientX, e.clientY, selection);
//   }else{
//     link = null
//     bubbleDOM.style.visibility = 'hidden';
//   }
// }, false);

function isNews(url){
  return url != null && url.includes("vox");
}

// Close the bubble when we click on the screen.
// document.addEventListener('mousedown', function (e) {
//   bubbleDOM.style.visibility = 'hidden';
// }, false);

function positionExpandButton(expandButton, x, y) {
  expandButton.style.top = y + 'px';
  expandButton.style.left = x + 'px'; //70
}