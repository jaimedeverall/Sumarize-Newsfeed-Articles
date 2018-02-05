const identifier = "gistfacebook"

console.log('reloading')
window.sessionStorage.clear();
$(".summary_dialog").remove()
$(".expand_button").remove()


// var keysToDelete = []

// Object.keys(window.sessionStorage).forEach(function(key){
//   console.log('reloading', key)
//   if(key.includes(identifier)){ //the key belongs to our extension
//     const id = key.substring(identifier.length)
//     var storyOptions = $(`a[id='${id}'`).first()
//     if(storyOptions === undefined || !isElementInViewport(storyOptions)){
//       console.log(storyOptions)
//       console.log(key)
//       keysToDelete.push(key)
//     }
//   }
// });

// for (var i = 0; i < keysToDelete.length; i++) {
//   window.sessionStorage.removeItem(keysToDelete[i])
// }

//console.log('reloading')
//console.log(window.sessionStorage.)
//Execute once at the start before the user has started to scroll.

$(window).scroll(function() {
  doSomething();
});

// $(window).scroll(function() {
//   var map = {}
//   Object.keys(window.sessionStorage).forEach(function(key){
//     console.log(key)
//     if(key.includes(identifier)){ //the key belongs to our extension
//       const id = key.substring(identifier.length)
//       var storyOptions = $(`a[id='${id}'`).get(0)
//       if(storyOptions !== undefined && isElementInViewport(storyOptions)){
//         map[key] = window.sessionStorage.getItem(key)
//       }
//     }
//   });
//   console.log(Object.keys(map).length)
//   window.sessionStorage.clear()
//   Object.keys(map).forEach(function(key){
//     console.log(key)
//     window.sessionStorage.setItem(key, map[key]);
//   });
//   $(".summary_dialog").remove()
//   $(".expand_button").remove()
//   $("a[aria-label='Story options'").each(function(index, element){
//     const key = identifier + element.id
//     const value = window.sessionStorage.getItem(key)
//     if(isElementInViewport(element)){
//       if(value === null){
//         window.sessionStorage.setItem(key, 'hidden')
//       }
//       var position = $(element).offset();
//       position.left -= 30
//       position.top -= 3
//       var expandButton = createExpandButton();
//       var dialog = createDialog();
//       expandButton.onclick = handleExpandButtonClick
//       document.body.appendChild(expandButton);
//       document.body.appendChild(dialog);
//       $(expandButton).css(position);
//       $(dialog).css({left: position.left, top: position.top, visiblility: window.sessionStorage.getItem(key)});
//     }
//   })
// })

function doSomething() {
  var map = {}
  Object.keys(window.sessionStorage).forEach(function(key){
    console.log(key)
    if(key.includes(identifier)){ //the key belongs to our extension
      const id = key.substring(identifier.length)
      var storyOptions = $(`a[id='${id}'`).get(0)
      if(storyOptions !== undefined && isElementInViewport(storyOptions)){
        map[key] = window.sessionStorage.getItem(key)
      }
    }
  });
  console.log(Object.keys(map).length)
  window.sessionStorage.clear()
  Object.keys(map).forEach(function(key){
    console.log(key)
    window.sessionStorage.setItem(key, map[key]);
  });
  $(".summary_dialog").remove()
  $(".expand_button").remove()
  $("a[aria-label='Story options'").each(function(index, element){
    const key = identifier + element.id
    var value = window.sessionStorage.getItem(key)
    if(isElementInViewport(element)){
      if(value === null){
        window.sessionStorage.setItem(key, 'hidden')
        value = 'hidden'
      }
      var position = $(element).offset();
      var expandButtonPosition = {left: position.left - 30, top: position.top - 3}
      var dialogPosition = {left: position.left - 30, top: position.top + 15}
      var expandButton = createExpandButton('button' + element.id);
      var dialog = createDialog('dialog' + element.id);
      expandButton.onclick = function(e){
        handleExpandButtonClick(e, element.id);
      }
      document.body.appendChild(expandButton);
      document.body.appendChild(dialog);
      $(expandButton).css(expandButtonPosition);
      $(dialog).css({left: dialogPosition.left, top: dialogPosition.top, visiblility: value});
    }
  })
}

function handleExpandButtonClick(event, id){
  var dialog = $(`#dialog${id}`).get(0)
  if(dialog !== undefined){
    console.log(dialog.style.visibility)
    if(dialog.style.visibility === "hidden" || dialog.style.visibility === ""){
      console.log('making visible');
      dialog.style.visibility = 'visible'
      window.sessionStorage.setItem(identifier + id, "visible");
    }else{
      console.log('making hidden')
      dialog.style.visibility = 'hidden'
      window.sessionStorage.setItem(identifier + id, "hidden");
    }
  }
}

function createExpandButton(id){
  var expandButton = document.createElement('input');
  var url = chrome.runtime.getURL('images/expandButton.png')
  expandButton.style.height = '25px';
  expandButton.style.width = '25px';
  expandButton.setAttribute('id', id)
  expandButton.setAttribute('type', 'image');
  expandButton.setAttribute('src', url);
  expandButton.setAttribute('class', 'expand_button');
  return expandButton
}

function createDialog(id){
  var dialog = document.createElement('img')
  var url = chrome.runtime.getURL('images/dialog.png')
  dialog.style.height = '75px';
  dialog.style.width = '100px';
  dialog.setAttribute('src', url);
  dialog.setAttribute('id', id)
  dialog.setAttribute('class', 'summary_dialog');
  return dialog
}

//Found on https://medium.com/talk-like/detecting-if-an-element-is-in-the-viewport-jquery-a6a4405a3ea2
function isElementInViewport(element){
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};

// function isElementInViewport (el) {
//   var rect = el.getBoundingClientRect();
//   return (
//     rect.top >= 0 &&
//     rect.left >= 0 &&
//     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&/*or $(window).height() */
//     rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
//   );
// }

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