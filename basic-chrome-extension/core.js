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
      var overall = $(storyOptionsElement).parent().parent().parent().get(0);
      console.log(overall)
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
//This function is not currently used.
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

function isNewsCard(storyOptionsElement){
  var overall = $(storyOptionsElement).parent().parent().parent().get(0);
  var newsLinkElement = $(overall).find("a[class='_52c6']").get(0)
  if(newsLinkElement !== undefined){
    return true
  }
  return false
}

function saveDetails(key, obj, url){
  chrome.runtime.sendMessage({endpoint: "summary", article_url: url}, function(response) {
    responseObj = JSON.parse(response);
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
      console.log(window.sessionStorage.getItem(key));
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
        saveDetails(key, newObj, url); //will make a request to server and save it to sessionStorage.
      }else{
        visibility = existingObj.visibility;
        author_reputability = existingObj.author_reputability;
        time_to_read = existingObj.time_to_read;
        recap = existingObj.recap;
      }

      var position = $(element).offset();
    
      var expandButton = createExpandButton('button' + element.id);
      var dialog = createDialog('dialog' + element.id);
      var summaryDiv = createSummaryDiv('summary' + element.id, recap);
      var metricsDiv = createMetricsDiv('metrics' + element.id, author_reputability, time_to_read);

      expandButton.onclick = function(e){
        handleExpandButtonClick(e, element.id);
      }

      document.body.appendChild(expandButton);
      document.body.appendChild(dialog);
      document.body.appendChild(summaryDiv);
      document.body.appendChild(metricsDiv);
  
      positionExpandButton(expandButton, position);
      positionDialog(dialog, position, visibility);
      positionSummaryDiv(summaryDiv, position, visibility);
      positionMetricsDiv(metricsDiv, position, visibility);
    }
  })
}

function positionExpandButton(expandButton, position){
  $(expandButton).css({left: position.left - 30, top: position.top - 3})
}

function positionDialog(dialog, position, visibility){
  $(dialog).css({left: position.left - 52, top: position.top + 23, visibility: visibility})
}

function positionSummaryDiv(summaryDiv, position, visibility){
  $(summaryDiv).css({left: position.left - 52, top: position.top + 110, visibility: visibility})
}

function positionMetricsDiv(metricsDiv, position, visibility){
  $(metricsDiv).css({left: position.left - 52, top: position.top + 50, visibility: visibility})
}

function handleExpandButtonClick(event, id){
  $(".summary_dialog").each(function(index, element){
    if(element.id !== undefined && element.id.includes(id)){
      var obj = JSON.parse(window.sessionStorage.getItem(identifier + id));
      if(element.style.visibility == "visible"){
        element.style.visibility = "hidden";
        obj.visibility = "hidden";
      }else{
        element.style.visibility = "visible";
        obj.visibility = "visible";
      }
      window.sessionStorage.setItem(identifier + id, JSON.stringify(obj));
    }
  })
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
  dialog.style.height = '300px';
  dialog.style.width = '400px';
  dialog.setAttribute('id', id);
  dialog.setAttribute('class', 'summary_dialog');
  dialog.setAttribute('src', url)
  return dialog
}

function createSummaryDiv(id, recap){
  var summaryDiv = document.createElement('div')
  summaryDiv.style.height = '200px';
  summaryDiv.style.width = '400px';
  summaryDiv.setAttribute('id', id);
  summaryDiv.setAttribute('class', 'summary_div');
  summaryDiv.setAttribute('class', 'summary_dialog');
  summaryDiv.innerHTML = recap;
  //"Knowing that millions of people around the world would be watching in person and on television and expecting great things from him — at least one more gold medal for America, if not another world record — during this, his fourth and surely his last appearance in the World Olympics, and realizing that his legs could no longer carry him down the runway with the same blazing speed and confidence in making a huge, eye-popping leap that they were capable of a few years ago when he set world records in the 100-meter dash and in the 400-meter relay and won a silver medal in the long jump, the renowned sprinter and track-and-field personality Carl Lewis, who had known pressure from fans and media before but never, even as a professional runner, this kind of pressure, made only a few appearances in races during the few months";
  return summaryDiv
}

function createMetricsDiv(id, author_reputability, time_to_read){
  var metricsDiv = document.createElement('div')
  metricsDiv.style.height = '70px';
  metricsDiv.style.width = '400px';
  metricsDiv.setAttribute('id', id);
  metricsDiv.setAttribute('class', 'summary_metrics');
  metricsDiv.setAttribute('class', 'summary_dialog');
  metricsDiv.innerHTML = "Author Reputability: " + author_reputability + "<br/> Time To Read: " + time_to_read + "<br/>";
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