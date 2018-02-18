console.log('user highlight capability activated')

// source: https://stackoverflow.com/questions/4712310/javascript-how-to-detect-if-a-word-is-highlighted
function createHighlightBox() {
  var dialog = document.createElement('div');
  dialog.setAttribute("class", "random")

  var highlightButton = document.createElement('input');

  var url = chrome.runtime.getURL('images/highlighter_icon.png')
  //highlightButton.setAttribute('src', url);
  highlightButton.style.height = '50px'
  highlightButton.style.width = '50px'
  highlightButton.setAttribute('type', 'image')
  highlightButton.setAttribute('src', url)

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
  console.log('newHeight', newHeight)
  $(highlight_box).css({height: `${newHeight}px`}); 
  $(highlight_box).css({width: `${newHeight}px`}); 
}
    
function createTriangle(){
  var smallTriangle = document.createElement('div');
  smallTriangle.setAttribute('class', 'summary_dialog triangle');
  return smallTriangle;
}

function popup_text() { 
  var text = getSelectedText(); 
  if (text && text.length > 2) { 
    var highlight_box = createHighlightBox(); 
    highlight_box.style.backgroundColor = 'red'; 
    console.log("appending popup box ... "); 
    document.body.appendChild(highlight_box);

    var rect = highlight_box.getBoundingClientRect();
    console.log("Dimensions: ", rect.top, rect.right, rect.bottom, rect.left);
    resizeHighlightBox(highlight_box);
    var r=window.getSelection().getRangeAt(0).getBoundingClientRect();
    var relative=document.body.parentNode.getBoundingClientRect();
    $(highlight_box).css('left', r.left + 5 + $(window).scrollLeft()); 
    $(highlight_box).css('top', r.top - 50 - 8 + $(window).scrollTop()); 

    var triangle = createTriangle() ;
    document.body.appendChild(triangle);
    $(triangle).css('left', r.left + 15 + $(window).scrollLeft())
    $(triangle).css('top', r.top - 8 + $(window).scrollTop())

    //highlight_box.style.bottom = r.top + 'px';
    //highlight_box.style.left = r.left + 'px'; 
    //highlight_box.style.top =(r.bottom -relative.top)+'px';//this will place ele below the selection
    //highlight_box.style.right=-(r.right-relative.right)+'px';//this will align the right edges together

    console.log("client height: " + highlight_box.style.top);
    console.log("client width: " + highlight_box.style.right);
  }
}

function remove_popup() { 
  $('.random').remove();
  $('.triangle').remove();
}

document.onkeyup = popup_text; 
document.onmouseup = popup_text; 

document.onmousedown = remove_popup;

