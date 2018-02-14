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
  chrome.runtime.sendMessage({endpoint: "summary", article_url: url}, function(response) {
    responseObj = JSON.parse(response);
    obj = JSON.parse(window.sessionStorage.getItem(key));
    obj.author_reputability = responseObj.author_reputability;
    obj.time_to_read = responseObj.time_to_read;
    obj.recap = responseObj.recap;
    window.sessionStorage.setItem(key, JSON.stringify(obj));
    doSomething();
  });
}

//"author_reputability":0,"recap":"","time_to_read":0.0036363636363636364
//getDetails("https://www.vox.com/2018/2/6/16982370/trump-asked-the-pentagon-start-planning-a-military-parade");

//actually it's fine not to delete anything because it's caching. just make sure to delete
//all relevant data during page reloads. and this is where the code may be fucking up.

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
      var dialog = createDialogDiv('dialog' + element.id);
      var triangle = createTriangle('triangle' + element.id);
      var summaryDiv = createSummaryDiv('summary' + element.id, recap);
      var metricsDiv = createMetricsDiv('metrics' + element.id, author_reputability, time_to_read);


      expandButton.onclick = function(e){
        handleExpandButtonClick(e, element.id);
      }

      document.body.appendChild(expandButton);
      document.body.appendChild(dialog);
      document.body.appendChild(summaryDiv);
      document.body.appendChild(metricsDiv);
      document.body.appendChild(triangle);
  
      positionExpandButton(expandButton, position);
      positionDialog(dialog, position, visibility);
      positionTriangle(triangle, position, visibility);
      positionSummaryDiv(summaryDiv, position, visibility);
      positionMetricsDiv(metricsDiv, position, visibility);
    }
  })
}

function positionExpandButton(expandButton, position){
  $(expandButton).css({left: position.left - 30, top: position.top - 3})
}

function positionDialog(dialog, position, visibility){
  $(dialog).css({left: position.left - 52, top: position.top + 26, visibility: visibility})
}

function positionSummaryDiv(summaryDiv, position, visibility){
  $(summaryDiv).css({left: position.left - 52, top: position.top + 80, visibility: visibility})
}

function positionMetricsDiv(metricsDiv, position, visibility){
  $(metricsDiv).css({left: position.left - 52, top: position.top + 30, visibility: visibility})
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

function createDialogDiv(id){
  var dialog = document.createElement('div');
  dialog.setAttribute('id', id);
  dialog.setAttribute('class', 'summary_dialog dialog_background');
  return dialog;
}

function createSummaryDiv(id, recap){
  var summaryDiv = document.createElement('div');
  summaryDiv.style.height = '200px';
  summaryDiv.style.width = '400px';
  summaryDiv.setAttribute('id', id);
  summaryDiv.setAttribute('class', 'summary_dialog summary_text');
  var summaryParagraph = document.createElement('p');
  summaryParagraph.innerHTML = recap;
  summaryDiv.appendChild(summaryParagraph);
  return summaryDiv
}

function createMetricsDiv(id, author_reputability, time_to_read){
  var metricsDiv = document.createElement('div')
  metricsDiv.style.height = '70px';
  metricsDiv.style.width = '400px';
  metricsDiv.setAttribute('id', id);
  metricsDiv.setAttribute('class', 'summary_dialog metrics_text');
  var metricsParagraph = document.createElement('p');
  metricsParagraph.innerHTML = "<span class='metrics_title'>Author Reputability: </span>" + author_reputability + "<br/> <span class='metrics_title'>Time To Read: </span>" + time_to_read + "<br/>";
  metricsDiv.appendChild(metricsParagraph);
  return metricsDiv
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