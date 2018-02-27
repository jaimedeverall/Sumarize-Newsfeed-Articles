console.log('user highlight capability activated')


// source: https://stackoverflow.com/questions/4712310/javascript-how-to-detect-if-a-word-is-highlighted
function createHighlightBox() {
  var dialog = document.createElement('div');
  dialog.setAttribute("class", "highlight_box")

  var highlightButton = document.createElement('input');

  var url = chrome.runtime.getURL('images/highlighter_icon.png');
  //highlightButton.setAttribute('src', url);
  highlightButton.style.height = '50px'
  highlightButton.style.width = '50px'
  highlightButton.setAttribute('type', 'image')
  highlightButton.setAttribute('src', url)
  highlightButton.setAttribute('class', 'highlightButton')

  dialog.appendChild(highlightButton); 
  return dialog
}


function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function resizeHighlightBox(highlight_box) { 
  const highlightChildren = $(highlight_box).children();
  const highlightButton = highlightChildren.get(0);

  const newHeight = $(highlightButton).height(); 
  $(highlight_box).css({height: `${newHeight}px`}); 
  $(highlight_box).css({width: `${newHeight}px`}); 
}
    
function createRedTriangle(){
  var smallTriangle = document.createElement('div');
  smallTriangle.setAttribute('class', 'red_triangle');
  return smallTriangle;
}

function popup_text() { 
  var text = getSelectedText(); 
  if (text == last_highlight) { 
    last_highlight = ""
    return;
  }
  if (text && text.length > 2) { 
    var highlight_box = createHighlightBox(); 
    highlight_box.style.backgroundColor = 'red'; 
    document.body.appendChild(highlight_box);
    popup_visible = true

    var rect = highlight_box.getBoundingClientRect();
    resizeHighlightBox(highlight_box);
    var r=window.getSelection().getRangeAt(0).getBoundingClientRect();
    var relative=document.body.parentNode.getBoundingClientRect();
    $(highlight_box).css('left', r.left + 5 + $(window).scrollLeft()); 
    $(highlight_box).css('top', r.top - 50 - 8 + $(window).scrollTop()); 
    leftBound = r.left + 5 + $(window).scrollLeft();
    topBound = r.top - 50 - 8 + $(window).scrollTop(); 

    var triangle = createRedTriangle() ;
    document.body.appendChild(triangle);

    $(triangle).css('left', r.left + 15 + $(window).scrollLeft())
    $(triangle).css('top', r.top - 8 + $(window).scrollTop())
  }
}

function highlightClicked() { 
  last_highlight = window.getSelection().toString(); 
  var location = document.location.href
  console.log(location)

  var details = {"source": "publisher_site", "article_url": location, "highlight": last_highlight}

  chrome.runtime.sendMessage({endpoint: "highlights", request_type: "POST", parameters: details}, function(response) {
    console.log("response received")
  });

  console.log("highlighted text: ", window.getSelection().toString()); 
}

function remove_popup(e) {
  // check if mouse down is in the button
  if (popup_visible) { 
    if (e.pageX < leftBound + width && e.pageX > leftBound 
      && e.pageY > topBound && e.pageY < topBound + height) { 
      highlightClicked(); 
    }
  }
  $('.highlight_box').remove();
  $('.red_triangle').remove();
  popup_visible = false
}


var popup_visible = false
var leftBound = 0 
var topBound = 0 
var height = 150 
var width = 150
var last_highlight = "" 

document.onkeyup = popup_text; 
document.onmouseup = popup_text; 
document.onmousedown = remove_popup;

