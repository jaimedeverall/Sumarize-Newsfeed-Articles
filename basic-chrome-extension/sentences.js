console.log('reloading');

saveTopSentences(document.URL);

//Gets called once on each page reload.
function saveTopSentences(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
    var topSentences = JSON.parse(response);
    if(Object.keys(topSentences).length > 0){
      highlightTopSentences(topSentences);
    }
  });
}

function replacer(match){
  return "<span class='highlighted_sentence'>" + match + "</span>";
}

function highlightTopSentences(topSentences){
  console.log(topSentences);
  Object.keys(topSentences).forEach(function(sentence){
    var score = topSentences[sentence];
    if(sentence.length > 0){
      const selector = `:contains('${sentence}')`;
      var domElement = $(selector).get(-1); //gets the last matched element i.e. the element closest to the text.
      if(domElement !== undefined){
        const oldInnerHTML = domElement.innerHTML;
        const regexString = sentence.replace(new RegExp('[^a-zA-Z0-9]', 'g'), '.*?');
        const re = new RegExp(regexString, 'g');
        const newInnerHTML = oldInnerHTML.replace(re, replacer);
        domElement.innerHTML = newInnerHTML;
      }
    }
  });
}