console.log('reloading highlights');

const highlightsDivWidth = 30;
const spacing = 8;
const elementIdentifier = 'gisthighlights'
const highlightsServerResponseKey = 'gisthighlights_response' + document.URL

setupHighlights(document.URL);

//Gets called once on each page reload.
function setupHighlights(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'is_news_article', request_type: 'GET', parameters: details}, function(response) {
    var is_news = JSON.parse(response)['is_news'];
    if(is_news === true){
      saveHighlights(url);
    }
  });
}

//Gets called once on each page reload if the url is a news article. Gets called by isNewsUrl.
function saveHighlights(url){
  const highlights = JSON.parse(window.sessionStorage.getItem(highlightsServerResponseKey));
  if(highlights === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'highlights', request_type: 'GET', parameters: details}, function(response) {
      var res = JSON.parse(response);
      console.log('highlights response', res);
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

//Called once on each page reload if the url is a news article. Gets called by saveHighlights.
function process(highlights){
  domElementsAndScores = tagElements(highlights);

  if(domElementsAndScores.length === 0){
    return;//stop before we set the interval if there are no matched domElements.
  }

  console.log('domElementsAndScores', domElementsAndScores);

  normalizeScores(domElementsAndScores);

  addHighlightDivs(domElementsAndScores);

  $(window).bind('scroll resize', function(e) {
    addHighlightDivs(domElementsAndScores);
  });

}

//Gets called once on each page reload.
function normalizeScores(domElementsAndScores){
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
  Object.keys(highlights).forEach(function(key){
    const sentence = highlights[key][0]
    const score = highlights[key][1]
    if(sentence.length > 0){
      const selector = `:contains('${sentence}')`;
      var domElement = $(selector).get(-1); //get the element closest to the text.
      if(domElement !== undefined){
        domElementsAndScores.push({element: domElement, score: score})
      }
    }
  });
  return domElementsAndScores;
}

//This function gets called every time the DOM changes.
function addHighlightDivs(domElementsAndScores){
  $('.highlights_div').remove();
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

function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = parts.join('');
}

var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"); 

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }

function toggleHighlights(event) { 
  if (event.keyCode == 79) {  //'o' 
    console.log("toggle invoked")
    $('.highlights_div').each(function(i, obj) {
      $(obj).toggle(); 
    //test
    });
    $('.highlighted_sentence').each(function(i, obj) {
      //console.log("background", $(obj).css('background-color'))
      ///var rgb = $(obj).css('background-color')
      //var hexcode = rgb2hex(rgb)
      //console.log("hexcode", rgb)
      //var hexcode = hexc(rgb)
      //console.log("hexcode: ", hexcode)
      //console.log("hexcode", hexcode)
      //if (hexcode == "98FB98") {
      //if (hexcode == "#98fb98") {
      //if (rgb != null) {
      if (highlights_on) {
        $(obj).css("background-color", "transparent")
        //$(obj).effect("highlight", { color: "#ffffff" }, 3000);
      } else {
        $(obj).css("background-color", "#98FB98")
        //$(obj).effect("highlight", { color: "#98FB98" }, 3000);
      }
      
    //test
    });
    highlights_on = !highlights_on
  }
}

console.log("updated version") 
console.log("hwere are you")
highlights_on = true
document.onkeydown = toggleHighlights
