console.log('reloading');
const serverResponseIdentifier = 'gistsentences_' + document.URL + '_raw_response';

saveTopSentences(document.URL);

//Gets called once on each page reload.
function saveTopSentences(url){
  const topSentences = JSON.parse(window.sessionStorage.getItem(serverResponseIdentifier));
  if(topSentences === null){
    var details = {article_url: url}
    chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
      console.log(response);
      var topSentences = JSON.parse(response);
      window.sessionStorage.setItem(serverResponseIdentifier, JSON.stringify(topSentences));
      highlightTopSentences(topSentences);
    });
  }else{
    highlightTopSentences(topSentences);
  }
}

function replacer(match){
  return "<span class='highlighted_sentence'>" + match + "</span>";
}

function highlightTopSentences(topSentences){
  console.log(topSentences);
  Object.keys(topSentences).forEach(function(sentence){
    var score = topSentences[sentence];
    if(sentence.length > 0){
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      var domElement = $(selector).get(0);
      if(domElement !== undefined){
        const oldInnerHTML = domElement.innerHTML;
        console.log(oldInnerHTML);
        console.log(sentence);
        const regexString = sentence.replace(new RegExp('[^a-zA-Z0-9]', 'g'), '.*?');
        console.log(regexString);
        const re = new RegExp(regexString, 'g');
        const newInnerHTML = oldInnerHTML.replace(re, replacer);
        console.log(newInnerHTML);
        domElement.innerHTML = newInnerHTML;
      }
    }
  });
}