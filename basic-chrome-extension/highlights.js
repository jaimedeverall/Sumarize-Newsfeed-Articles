console.log('reloading');

const highlightsDivWidth = 30;
const spacing = 8;
const elementIdentifier = 'gisthighlights'

saveHighlights(document.URL);

//Gets called once on each page reload.
function saveHighlights(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'highlights', request_type: 'GET', parameters: details}, function(response) {
    var res = JSON.parse(response);
    var highlights = res.highlights;
    if(highlights !== undefined){
      process(highlights);
    }
  });
}

//Gets called once on each page reload.
function process(highlights){
  domElementsAndScores = tagElements(highlights);
  normalizeScores(domElementsAndScores);
  console.log(domElementsAndScores);
  var looperCounter = 0;
  var looper = setInterval(function(){
    $('.highlights_div').remove();
    console.log(looperCounter);
    addHighlights(domElementsAndScores);
    looperCounter++;
    if (looperCounter >= 60){
      clearInterval(looper);
    }
  }, 1000);
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
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      var domElement = $(selector).get(0)
      if(domElement !== undefined){
        domElement.setAttribute(elementIdentifier, counter)//have to reset everytime DOM is rendered.
        domElementsAndScores.push({element: domElement, score: score})
        counter += 1
      }
    }
  });
  return domElementsAndScores;
}

function addHighlights(domElementsAndScores){
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
