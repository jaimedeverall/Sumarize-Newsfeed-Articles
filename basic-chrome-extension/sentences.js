console.log('reloading');
const serverResponseIdentifier = 'gistsentences_' + document.URL + '_raw_response';

saveTopSentences(document.URL);

//Gets called once on each page reload.
function saveTopSentences(url){
  const topSentences = JSON.parse(window.sessionStorage.getItem(serverResponseIdentifier));
  if(topSentences === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
      var topSentences = JSON.parse(response);
      window.sessionStorage.setItem(serverResponseIdentifier, JSON.stringify(topSentences));
      highlightTopSentences(topSentences);
    });
  }else{
    highlightTopSentences(topSentences);
  }
}

function highlightTopSentences(topSentences){
  Object.keys(topSentences).forEach(function(sentence){
    var score = topSentences[sentence];
    if(sentence.length > 0){
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      var domElement = $(selector).get(0);
      if(domElement !== undefined){
        const oldInnerHTML = domElement.innerHTML;
        console.log(oldInnerHTML);
        console.log(sentence);
        const regexString = sentence.replace(new RegExp(' ', 'g'), '.*?');
        console.log(regexString);
        const re = new RegExp(regexString);
        const newInnerHTML = oldInnerHTML.replace(re, "<span class='highlighted_sentence'>" + sentence + "</span>");
        console.log(newInnerHTML);
        domElement.innerHTML = newInnerHTML;
      }
    }
  });
}