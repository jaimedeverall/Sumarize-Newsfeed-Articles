console.log('reloading');
const highlightsDivWidth = 30;
const spacing = 5;
const serverResponseIdentifier = 'gisthighlights_' + document.URL + '_raw_response';
const elementIdentifier = 'gisthighlights'

saveHighlights(document.URL);

//Gets called once on each page reload.
function saveHighlights(url){
  const highlights = JSON.parse(window.sessionStorage.getItem(serverResponseIdentifier));
  if(highlights === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'highlights', request_type: 'GET', parameters: details}, function(response) {
      var res = JSON.parse(response);
      window.sessionStorage.setItem(serverResponseIdentifier, JSON.stringify(res.highlights));
      process(res.highlights);
    });
  }else{
    process(highlights);
  }
}

//Gets called once on each page reload.
function process(highlights){
  console.log(highlights);
  domElements = tagElements(highlights);
  var looperCounter = 0;
  var looper = setInterval(function(){
    $('.highlights_div').remove();
    console.log(looperCounter);
    addHighlights(domElements);
    looperCounter++;
    if (looperCounter >= 60){
      clearInterval(looper);
    }
  }, 1000);
}

//Gets called once on each page reload.
function tagElements(highlights){
  var domElements = []
  var counter = 0
  Object.keys(highlights).forEach(function(key){
    const sentence = highlights[key][0]
    const score = highlights[key][1]
    if(sentence.length > 0){
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      var domElement = $(selector).get(0)
      if(domElement !== undefined){
        domElement.setAttribute(elementIdentifier, counter)//have to reset everytime DOM is rendered.
        domElements.push({element: domElement, score: score})
        counter += 1
      }
    }
  });
  console.log(domElements);
  return domElements;
}

function addHighlights(domElements){
  //eventually see if you can move this code to cache.
  var leftMostPosition = null

  for(var i=0; i<domElements.length; i++){
    var domElement = domElements[i].element;
    var position = $(domElement).offset();
    if(leftMostPosition == null){
      leftMostPosition = position.left;
    }else{
      if(position.left < leftMostPosition){
        leftMostPosition = position.left;
      }
    }
  }

  for(var i=0; i<domElements.length; i++){
    var element = domElements[i].element;
    var score = domElements[i].score;
    var position = $(element).offset();
    var height = $(element).height();
    var highlightsDiv = createHighlightsDiv(height, score);
    positionHighlightsDiv(highlightsDiv, leftMostPosition, position.top)
    document.body.appendChild(highlightsDiv);
  }

}

function createHighlightsDiv(height, score){
  var highlightsDiv = document.createElement('div');
  $(highlightsDiv).css({height: height, width: highlightsDivWidth});
  highlightsDiv.setAttribute('class', 'highlights_div');
  return highlightsDiv
}

function positionHighlightsDiv(highlightsDiv, leftMost, top){
  var left = leftMost - spacing - highlightsDivWidth;
  $(highlightsDiv).css({top: top, left: left})
}
