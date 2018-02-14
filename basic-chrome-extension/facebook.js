const identifier = "gistfacebook"

console.log('reloading');

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
  doSomething();
});

function findNewsLink(){
  $("a[aria-label='Story options'").each(function(index, element){
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

//This function will return the news url if it is a story otherwise it will return null
function getNewsUrl(storyOptionsElement){
  var overall = $(storyOptionsElement).parent().parent().parent().get(0);
  var newsLinkElement = $(overall).find("a[class='_52c6']").get(0)
  if(newsLinkElement !== undefined){
    const url = newsLinkElement.href
    if(url !== undefined && url !== null){
      return url
    }
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
  chrome.runtime.sendMessage({endpoint: "summary", source: "facebook", article_url: url}, function(response) {
    responseObj = JSON.parse(response);
    obj = JSON.parse(window.sessionStorage.getItem(key));
    obj.author_reputability = responseObj.author_reputability;
    obj.time_to_read = responseObj.time_to_read;
    obj.recap = responseObj.recap;
    window.sessionStorage.setItem(key, JSON.stringify(obj));
    doSomething();
  });
}

function doSomething() {
  $(".summary_dialog").remove()
  $(".expand_button").remove()
  $("a[aria-label='Story options']").each(function(index, element){

    const key = identifier + element.id;

    var existingObj = null;
    if(window.sessionStorage.getItem(key) !== null){
      existingObj = JSON.parse(window.sessionStorage.getItem(key));
    }

    const url = getNewsUrl(element);

    if(isElementInViewport(element) && url !== null){
      var visibility = 'hidden';
      var author_reputability = 0;
      var time_to_read = 0;
      var recap = 'This is the default recap';

      if(existingObj === null){
        var newObj = {visibility: visibility, author_reputability: author_reputability, time_to_read: time_to_read, recap: recap};
        window.sessionStorage.setItem(key, JSON.stringify(newObj))
        saveDetails(key, url);
      }else{
        visibility = existingObj.visibility;
        author_reputability = existingObj.author_reputability;
        time_to_read = existingObj.time_to_read;
        recap = existingObj.recap;
      }

      var position = $(element).offset();
    
      var expandButton = createExpandButton('button' + element.id);
      var dialog = createDialog('dialog' + element.id, recap, author_reputability, time_to_read);
      var triangle = createTriangle('triangle' + element.id);

      expandButton.onclick = function(e){
        handleExpandButtonClick(e, element.id);
      }

      document.body.appendChild(expandButton);
      document.body.appendChild(dialog);
      document.body.appendChild(triangle);
  
      positionExpandButton(expandButton, position);
      positionDialog(dialog, position, visibility);
      positionTriangle(triangle, position, visibility);
    }
  })
}

function positionExpandButton(expandButton, position){
  $(expandButton).css({left: position.left - 30, top: position.top - 3})
}

function positionDialog(dialog, position, visibility){
  $(dialog).css({left: position.left - 52, top: position.top + 26, visibility: visibility})
}

function positionTriangle(triangle, position, visibility){
  $(triangle).css({left: position.left - 24, top: position.top + 20, visibility: visibility})
}

function handleExpandButtonClick(event, id){
  $(".summary_dialog").each(function(index, element){
    if(element.id !== undefined && element.id.includes(id)){
      const key = identifier + id
      var obj = JSON.parse(window.sessionStorage.getItem(key));

      if(element.style.visibility == "visible"){
        element.style.visibility = "hidden";
        obj.visibility = "hidden";
      }else{
        element.style.visibility = "visible";
        obj.visibility = "visible";
      }

      window.sessionStorage.setItem(key, JSON.stringify(obj));
    }
  })
}

function createDialog(id, recap, author_reputability, time_to_read){
  var dialog = document.createElement('div');
  dialog.setAttribute('id', id);
  dialog.setAttribute('class', 'summary_dialog dialog_background');

  var summaryDiv = document.createElement('div');
  summaryDiv.setAttribute('class', 'summary_text');
  var summaryParagraph = document.createElement('p');
  summaryParagraph.innerHTML = recap;
  summaryDiv.appendChild(summaryParagraph);

  var metricsDiv = document.createElement('div')
  metricsDiv.setAttribute('class', 'metrics_text');
  var metricsParagraph = document.createElement('p');
  metricsParagraph.innerHTML = "<span class='metrics_title'>Author Reputability: </span>" + author_reputability + "<br/> <span class='metrics_title'>Time To Read: </span>" + time_to_read + "<br/>";
  metricsDiv.appendChild(metricsParagraph);

  dialog.appendChild(metricsDiv);
  dialog.appendChild(summaryDiv);
  return dialog
}

function createTriangle(id){
  var smallTriangle = document.createElement('div');
  smallTriangle.setAttribute('class', 'summary_dialog triangle');
  smallTriangle.setAttribute('id', id)
  return smallTriangle;
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

//Found on https://medium.com/talk-like/detecting-if-an-element-is-in-the-viewport-jquery-a6a4405a3ea2
function isElementInViewport(element){
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};

function isNews(url){
  return url !== null && url.includes("vox");
}