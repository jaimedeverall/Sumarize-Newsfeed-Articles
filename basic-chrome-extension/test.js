console.log('test.js')
const highlightsDivWidth = 30;
const spacing = 5;
const identifier = 'gisthighlights'
var counter = 0;

function getHighlights(url){
  console.log('getting highlights');
  const highlights = JSON.parse(window.sessionStorage.getItem(identifier));
  if(highlights === null){
    chrome.runtime.sendMessage({endpoint: "highlights", article_url: url}, function(response) {
      console.log('saving highlights');
      var obj = JSON.parse(response);
      var highlights = obj.highlights
      window.sessionStorage.setItem(identifier, JSON.stringify(highlights));
      createHighlights(highlights);
    });
  }else{
    createHighlights(highlights)
  }
}

function createHighlights(highlights){
  var leftMostPosition = null
  var matchedElements = []
  Object.keys(highlights).forEach(function(key){
    const sentence = highlights[key][0]
    const score = highlights[key][1]
    if(sentence.length > 0){
      console.log(sentence);
      console.log(score);
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      var matchedElement = $(selector).get(0)
      if(matchedElement !== undefined){
        console.log(matchedElement);
        var position = $(matchedElement).offset();
        if(leftMostPosition == null){
          leftMostPosition = position.left;
        }else{
          if(position.left < leftMostPosition){
            leftMostPosition = position.left;
          }
        }
        matchedElements.push({element: matchedElement, score: score})
      }
    }
  });

  for(var i=0; i<matchedElements.length; i++){
    var element = matchedElements[i].element;
    var score = matchedElements[i].score;
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

window.addEventListener("load", function(event){
  var looper = setInterval(function(){
    $('.highlights_div').remove();
    getHighlights(document.URL);
    counter++;
    if (counter >= 30){
      clearInterval(looper);
    }
  }, 1000);
});
