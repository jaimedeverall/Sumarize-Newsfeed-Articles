console.log('reloading sentences');
const sentencesServerResponse = 'gistsentences_response' + document.URL;

isNewsUrl(document.URL);

function isNewsUrl(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'is_news_article', request_type: 'GET', parameters: details}, function(response) {
    var is_news = JSON.parse(response)['is_news'];
    console.log(url);
    console.log(is_news);
    if(is_news === true){
      saveTopSentences(url);
    }
  });
}

//Gets called once on each page reload.
function saveTopSentences(url){
  const topSentences = JSON.parse(window.sessionStorage.getItem(sentencesServerResponse));
  if(topSentences === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
      console.log(response);
      var topSentences = JSON.parse(response);
      if(Object.keys(topSentences).length > 0){
        window.sessionStorage.setItem(sentencesServerResponse, JSON.stringify(topSentences));
        highlightTopSentences(topSentences);
      }
    });
  }else{
    highlightTopSentences(topSentences);
  }
}

function replacer(match){
  return "<span class='highlighted_sentence'>" + match + "</span>";
}

//Could consider also reversing oldInnerHTML and regexString and see which of the matches are shorter.
function highlightTopSentences(topSentences){
  console.log('topSentences', topSentences);
  Object.keys(topSentences).forEach(function(sentence){
    var score = topSentences[sentence];
    if(sentence.length > 0){
      const selector = `:contains('${sentence}')`;
      var domElement = $(selector).get(-1); //gets the last matched element i.e. the element closest to the text.
      if(domElement !== undefined){
        const oldInnerHTML = domElement.innerHTML;
        const regexString = sentence.replace(new RegExp('[^a-zA-Z0-9]', 'g'), '.+?');
        var re = new RegExp(regexString);
        const newInnerHTML = oldInnerHTML.replace(re, replacer);
        domElement.innerHTML = newInnerHTML;
      }
    }
  });
}