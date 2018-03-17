const identifier = "gistfacebook";

// all the click throughs, all the expansion clicks

$(".summary_dialog").remove()
$(".expand_button").remove()

//Currently not using this code, but should integrate eventually to prevent sessionStorage from
//getting too large.
function deleteAllAppKeys(){
  var keysToDelete = []
  Object.keys(window.sessionStorage).forEach(function(key){
    if(key.includes(identifier)){ //the key belongs to our extension
      keysToDelete.push(key)
    }
  });
  for(i=0; i<keysToDelete.length; i++){
    window.sessionStorage.removeItem(keysToDelete[i])
  }
}

$(window).bind('scroll resize', function(e) {
  addButtonsAndDialogs();
});

$(window).click(function(e){
  var ignoreClick = false

  $(".expand_button").each(function(index, element){

    if(elementClicked(e.pageX, e.pageY, element)){
      ignoreClick = true;
    }

  })

  if(ignoreClick === true){
    return;
  }

  //summary_dialog class includes triangles and dialogs.
  $(".summary_dialog").each(function(index, element){
    //If any triangle or dialog is clicked then we can ignore this click.
    if(elementClicked(e.pageX, e.pageY, element)){
      ignoreClick = true;
    }

  })

  if(ignoreClick === true){
    return
  }

  Object.keys(window.sessionStorage).forEach(function(key){
    if(key.includes(identifier)){ //the key belongs to our extension
      var obj = JSON.parse(window.sessionStorage.getItem(key));
      if(obj === null){
        return;
      }
      obj.visibility = 'hidden';
      window.sessionStorage.setItem(key, JSON.stringify(obj));
    }
  });

  addButtonsAndDialogs();
  
});

function elementClicked(x, y, element){
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).outerHeight();
  var elementLeft = $(element).offset().left;
  var elementRight = elementLeft + $(element).outerWidth();
  return x >= elementLeft && x <= elementRight && y >= elementTop && y <= elementBottom;
}

//This function is not used.
function findNewsLink(){
  $("a[aria-label='Story options']").each(function(index, element){
    if(isElementInViewport(element)){
      var overall = $(element).parent().parent().parent().get(0);
      var newsLinkElement = $(overall).find("a[class='_52c6']").get(0)
      if(newsLinkElement !== undefined){
        const url = newsLinkElement.href
        if(isNews(url)){
          console.log(element)
          console.log(url)
        }
      }
    }
  })
}

//This function is not used.
function getNewsUrl(storyOptionsElement){
  //I don't like this code, it's janky and may break!
  var overall = $(storyOptionsElement).parent().parent().parent().get(0);
  if(overall === undefined){
    return null;
  }
  var newsLinkElement = $(overall).find("a[class='_52c6']").get(0)
  if(newsLinkElement === undefined){
    return null;
  }
  const url = newsLinkElement.href
  if(url !== undefined){
    return url
  }
  return null
}

//This function is not used.
function isNewsCard(storyOptionsElement){
  var overall = $(storyOptionsElement).parent().parent().parent().get(0);
  var newsLinkElement = $(overall).find("a[class='_52c6']").get(0)
  if(newsLinkElement !== undefined){
    return true
  }
  return false
}

function saveDetails(key, url){
  var details = {"source": "facebook", "article_url": url}
  chrome.runtime.sendMessage({endpoint: "summary", request_type: "GET", parameters: details}, function(response) {
    obj = JSON.parse(window.sessionStorage.getItem(key));
    //If there is no key in sessionStorage, something has gone wrong so we don't do anything.
    if(obj === null){
      return;
    }
    responseObj = JSON.parse(response);

    obj.loaded = true;
    obj.author_reputability = responseObj.author_reputability;
    obj.time_to_read = responseObj.time_to_read;
    obj.recap = responseObj.recap;
    window.sessionStorage.setItem(key, JSON.stringify(obj));
    addButtonsAndDialogs();
  });
}

function sendLoggingRequest(url, type) { 
  var details = {"url": url, "type": type}
  chrome.runtime.sendMessage({endpoint: "logging", request_type: "POST", parameters: details}, function(response) {
  });
}

function addButtonsAndDialogs() {
  $(".summary_dialog").remove()
  $(".expand_button").remove()
  $("div[role='article']").each(function(index, element){
    const storyOptions = $(element).find("a[aria-label='Story options']").get(0);

    if(storyOptions === undefined){
      return;
    }

    if(!isElementInViewport(storyOptions)){
      return;
    }
    
    var a = findLinkElement(element);

    if(a === undefined || storyOptions === undefined){
      return;
    }

    const url = a.getAttribute('href');

    var div = linkOnclick(element)
    div.onclick = function(e) {
      sendLoggingRequest(url, "click_through") 
    }

    if(url === undefined || url === null){
      return;
    }

    const key = identifier + url;
    var existingObj = JSON.parse(window.sessionStorage.getItem(key));

    var loaded = false;
    var visibility = 'hidden';

    if(existingObj === null){
      var newObj = {visibility: 'hidden', loaded: false};
      window.sessionStorage.setItem(key, JSON.stringify(newObj));
      saveDetails(key, url);
    }else{
      visibility = existingObj.visibility;
      loaded = existingObj.loaded;
    }

    var position = $(storyOptions).offset();
    
    var expandButton = createButton(key);
    var dialog = createDialog(key, loaded);
    var triangle = createTriangle(key);

    expandButton.onclick = function(e){
      handleExpandButtonClick(e, key, expandButton);
      sendLoggingRequest(url, "expand_button")
    }

    $(dialog).css({visibility: visibility});
    $(triangle).css({visibility: visibility});

    document.body.appendChild(expandButton);
    document.body.appendChild(dialog);
    document.body.appendChild(triangle);

    resizeDialog(dialog, loaded);
  
    positionExpandButton(expandButton, position);
    positionDialog(dialog, position);
    positionTriangle(triangle, position);
  })
}

function getVisibility(key){
  var obj = JSON.parse(window.sessionStorage.getItem(key));
  var visibility = 'hidden';
  if(obj !== null && obj.visibility !== undefined){
    visibility = obj.visibility;
  }
  return visibility;
}

function findLinkElement(element){
  var a = $(element).find("a[class='_52c6']").get(0);
  if(a !== undefined){
    return a
  }
  a = $(element).find("a[class='_275_']").get(0);
  if(a !== undefined){
    return a
  }
  return a
}

function linkOnclick(element) {
  var div = $(element).find("._3x-2").get(0);
  if (div !== undefined) {
    console.log("defined")
  } else {
    console.log("undefined")
  }
  return div
}

function resizeDialog(dialog, loaded){
  if(loaded === true){
    const children = $(dialog).children();
    const metricsDiv = children.get(0);
    const summaryDiv = children.get(1);
    const brandDiv = children.get(2); 
    const newHeight = $(summaryDiv).height() + $(metricsDiv).height() + $(brandDiv).height() * 2;
    $(dialog).css({height: `${newHeight}px`});
  }
}

function positionExpandButton(expandButton, position){
  $(expandButton).css({left: position.left - 60, top: position.top - 3})
}

function positionDialog(dialog, position){
  $(dialog).css({left: position.left - 60, top: position.top + 30})
}

function positionTriangle(triangle, position){
  $(triangle).css({left: position.left - 50, top: position.top + 25})
}

function handleExpandButtonClick(event, key, button){
  const visibility = getVisibility(key);
  const newVisibility = toggleVisibility(visibility);

  var obj = JSON.parse(window.sessionStorage.getItem(key));
  obj.visibility = newVisibility;
  window.sessionStorage.setItem(key, JSON.stringify(obj));

  button.setAttribute('src', getImageUrl(newVisibility));

  $(".summary_dialog").each(function(index, element){
    if(element.id !== undefined && element.id === key){
      element.style.visibility = newVisibility;
    }
  })
}

function toggleVisibility(visibility){
  var newVisibility = 'hidden';
  if(visibility === 'hidden'){
    newVisibility = 'visible';
  }
  return newVisibility;
}

function getImageUrl(visibility){
  var path = 'images/open.png';
  if(visibility === 'visible'){
    path = 'images/close.png';
  }
  return chrome.runtime.getURL(path);
}

function createDialog(key, loaded){
  const dialogID = key;
  var dialog = document.createElement('div');
  dialog.setAttribute('id', dialogID);
  dialog.setAttribute('class', 'summary_dialog dialog_background');
  if(loaded === false){
    return dialog;
  }

  const obj = JSON.parse(window.sessionStorage.getItem(key));
  var recap = obj.recap;
  var author_reputability = obj.author_reputability;
  var time_to_read = obj.time_to_read;

  var metricsDiv = document.createElement('div')
  metricsDiv.setAttribute('class', 'metrics_text');
  var metricsParagraph = document.createElement('p');
  metricsParagraph.innerHTML = "<span class='metrics_title'>Time To Read: </span>" + time_to_read + "<br/>";
  metricsDiv.appendChild(metricsParagraph);

  var summaryDiv = document.createElement('div');
  summaryDiv.setAttribute('class', 'summary_text');
  //var res = recap.split(".")
  var list = document.createElement('ul') 
  $(list).css("list-style-type", "disc")
  $(list).css("list-style-position", "inside")
  $(list).css('padding-left', '10px')

  var stamp = document.createElement('p')
  stamp.innerHTML = "<span> Made with &hearts; by Gist. </span>"
  $(stamp).css('padding-left', '10px')
  $(stamp).css('color', '#4468B0')
  $(stamp).css('font-size', '14px')
  $(stamp).css('line-height', '1.38')

  for (var i = 0; i < recap.length; i++) { 
    if (recap[i].length == 0) {
      continue
    }
    var element = document.createElement('li')
    element.innerHTML = recap[i]
    if (i < recap.length - 1) {
       element.innerHTML += "<br/><br/>" 
    }
    list.appendChild(element)
  }

  dialog.appendChild(metricsDiv);
  dialog.appendChild(list)
  dialog.appendChild(stamp)
  return dialog
}

function createTriangle(key){
  const triangleID = key;
  var smallTriangle = document.createElement('div');
  smallTriangle.setAttribute('class', 'summary_dialog dialog_triangle');
  smallTriangle.setAttribute('id', triangleID);
  return smallTriangle;
}

function createButton(key){
  const visibility = getVisibility(key);
  var expandButton = document.createElement('input');
  var imageUrl = getImageUrl(visibility);
  expandButton.style.height = '30px';
  expandButton.style.width = '51px';
  expandButton.setAttribute('id', key);
  expandButton.setAttribute('type', 'image');
  expandButton.setAttribute('src', imageUrl);
  expandButton.setAttribute('class', 'expand_button');
  return expandButton
}

//Found on https://medium.com/talk-like/detecting-if-an-element-is-in-the-viewport-jquery-a6a4405a3ea2
function isElementInViewport(element){
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};
