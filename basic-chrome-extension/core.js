const identifier = "gistfacebook"

console.log('reloading')

$(".summary_dialog").remove()
$(".expand_button").remove()

//verify that this code is working.
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
deleteAllAppKeys();

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
    if(isNews(url)){
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

//actually it's fine not to delete anything because it's caching. just make sure to delete
//all relevant data during page reloads. and this is where the code may be fucking up.

function doSomething() {
  $(".summary_dialog").remove()
  $(".expand_button").remove()
  $("a[aria-label='Story options']").each(function(index, element){
    const key = identifier + element.id
    var value = window.sessionStorage.getItem(key)
    if(isElementInViewport(element) && isNewsCard(element)){
      if(value === null){
        window.sessionStorage.setItem(key, 'hidden')
        value = 'hidden'
      }
      var position = $(element).offset();
    
      var expandButton = createExpandButton('button' + element.id);
      var dialog = createDialog('dialog' + element.id);
      var summaryDiv = createSummaryDiv('summary' + element.id);
      var metricsDiv = createMetricsDiv('metrics' + element.id);

      expandButton.onclick = function(e){
        handleExpandButtonClick(e, element.id);
      }

      document.body.appendChild(expandButton);
      document.body.appendChild(dialog);
      document.body.appendChild(summaryDiv);
      document.body.appendChild(metricsDiv);
  
      positionExpandButton(expandButton, position)
      positionDialog(dialog, position, value)
      positionSummaryDiv(summaryDiv, position, value)
      positionMetricsDiv(metricsDiv, position, value)
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
      if(element.style.visibility == "visible"){
        element.style.visibility = "hidden"
        window.sessionStorage.setItem(identifier + id, "hidden");
      }else{
        element.style.visibility = "visible"
        window.sessionStorage.setItem(identifier + id, "visible");
      }
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

function createSummaryDiv(id){
  var summaryDiv = document.createElement('div')
  summaryDiv.style.height = '200px';
  summaryDiv.style.width = '400px';
  summaryDiv.setAttribute('id', id);
  summaryDiv.setAttribute('class', 'summary_div');
  summaryDiv.setAttribute('class', 'summary_dialog');
  summaryDiv.innerHTML = "Knowing that millions of people around the world would be watching in person and on television and expecting great things from him — at least one more gold medal for America, if not another world record — during this, his fourth and surely his last appearance in the World Olympics, and realizing that his legs could no longer carry him down the runway with the same blazing speed and confidence in making a huge, eye-popping leap that they were capable of a few years ago when he set world records in the 100-meter dash and in the 400-meter relay and won a silver medal in the long jump, the renowned sprinter and track-and-field personality Carl Lewis, who had known pressure from fans and media before but never, even as a professional runner, this kind of pressure, made only a few appearances in races during the few months";
  return summaryDiv
}

function createMetricsDiv(id){
  var metricsDiv = document.createElement('div')
  metricsDiv.style.height = '70px';
  metricsDiv.style.width = '400px';
  metricsDiv.setAttribute('id', id);
  metricsDiv.setAttribute('class', 'summary_metrics');
  metricsDiv.setAttribute('class', 'summary_dialog');
  metricsDiv.innerHTML = "Average Percentage Read: <br/> Author Reputability: <br/> Read Time: <br/>";
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