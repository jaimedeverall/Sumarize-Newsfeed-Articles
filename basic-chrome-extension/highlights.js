console.log('reloading highlights');

const highlightsDivWidth = 30;
const spacing = 8;
const elementIdentifier = 'gisthighlights'
const highlightsServerResponseKey = 'gisthighlights_response' + document.URL;

saveHighlights(document.URL);

//Gets called once on each page reload.
function saveHighlights(url){
  const highlights = JSON.parse(window.sessionStorage.getItem(highlightsServerResponseKey));
  if(highlights === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'highlights', request_type: 'GET', parameters: details}, function(response) {
      var res = JSON.parse(response);
      var highlights = res.highlights;
      if(highlights !== undefined && Object.keys(highlights).length > 0){
        window.sessionStorage.setItem(highlightsServerResponseKey, JSON.stringify(highlights));
        process(highlights);
      }
    });
  }else{
    process(highlights);
  }
}

//Called once on each page reload.
function process(highlights){
  domElementsAndScores = tagElements(highlights);
  if(domElementsAndScores.length === 0){
    return;//stop before we set the interval if there are no matched domElements.
  }
  normalizeScores(domElementsAndScores);

  addHighlightDivs(domElementsAndScores);

  var highlightsMutationObserverConfig = {attributes: true, childList: true};
  // Create an observer instance linked to the callback function
  var highlightsMutationObserver = new MutationObserver(function(mutationsList){
    highlightsMutationObserver.disconnect();
    $('.highlights_div').remove();
    addHighlightDivs(domElementsAndScores);
    highlightsMutationObserver.observe(document.body, highlightsMutationObserverConfig);
  });
  highlightsMutationObserver.observe(document.body, highlightsMutationObserverConfig);
}

//Gets called once on each page reload.
function normalizeScores(domElementsAndScores){
  //score - minScore / (maxScore - minScore)
  var minScore = 1
  var maxScore = 0
  for(var i=0; i<domElementsAndScores.length; i++){
    var score = domElementsAndScores[i].score;
    minScore = Math.min(minScore, score);
    maxScore = Math.max(maxScore, score);
  }

  for(var i=0; i<domElementsAndScores.length; i++){
    var score = domElementsAndScores[i].score
    domElementsAndScores[i].score = 1.0*(score - minScore) / (maxScore - minScore)
  }
}

//Gets called once on each page reload.
function tagElements(highlights){
  var domElementsAndScores = []
  var counter = 0
  Object.keys(highlights).forEach(function(key){
    const sentence = highlights[key][0]
    const score = highlights[key][1]
    if(sentence.length > 0){
      const selector = `:contains('${sentence}')`;
      var domElement = $(selector).get(-1); //get the element closest to the text.
      if(domElement !== undefined){
        domElement.setAttribute(elementIdentifier, counter)//have to reset everytime DOM is rendered.
        domElementsAndScores.push({element: domElement, score: score})
        counter += 1
      }
    }
  });
  return domElementsAndScores;
}

//This function gets called every time the DOM changes.
function addHighlightDivs(domElementsAndScores){
  //eventually see if you can move this code to cache.
  var leftMostPosition = null

  for(var i=0; i<domElementsAndScores.length; i++){
    var domElement = domElementsAndScores[i].element;
    var position = $(domElement).offset();
    if(leftMostPosition == null){
      leftMostPosition = position.left;
    }else{
      if(position.left < leftMostPosition){
        leftMostPosition = position.left;
      }
    }
  }

  for(var i=0; i<domElementsAndScores.length; i++){
    var element = domElementsAndScores[i].element;
    var score = domElementsAndScores[i].score;
    var position = $(element).offset();
    var height = $(element).height();
    var highlightsDiv = createHighlightsDiv(height, score);
    positionHighlightsDiv(highlightsDiv, leftMostPosition, position.top)
    document.body.appendChild(highlightsDiv);
  }

}

function createHighlightsDiv(height, score){
  var highlightsDiv = document.createElement('div');
  $(highlightsDiv).css({height: height, width: highlightsDivWidth, opacity: score});
  highlightsDiv.setAttribute('class', 'highlights_div');
  return highlightsDiv
}

function positionHighlightsDiv(highlightsDiv, leftMost, top){
  var left = leftMost - spacing - highlightsDivWidth;
  $(highlightsDiv).css({top: top, left: left})
}
