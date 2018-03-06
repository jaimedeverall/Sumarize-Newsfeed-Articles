console.log('reloading sentences');

const gist_sentences_identifier = 'gistsentences'

chrome.runtime.sendMessage({get_open_tab_url: true}, function(response) {
  obj = JSON.parse(response);
  const is_tab_open = obj.is_tab_open;
  const url = obj.url;
  if(is_tab_open === true && document.URL === url){
    saveTopSentences(url);
  }
});

//Gets called once on each page reload.
function saveTopSentences(url){
  const key = gist_sentences_identifier + '_' + url;
  const topSentences = JSON.parse(window.sessionStorage.getItem(key));
  if(topSentences === null){
    var details = {article_url: url};
    chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
      var topSentences = JSON.parse(response);
      if(Object.keys(topSentences).length > 0){
        window.sessionStorage.setItem(key, JSON.stringify(topSentences));
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
  Object.keys(topSentences).forEach(function(sentence){
    var score = topSentences[sentence];
    if(sentence.length > 0){
      const selector = `:contains('${sentence}')`;
      var domElement = $(selector).get(-1); //gets the last matched element i.e. the element closest to the text.
      if(domElement !== undefined){
        const oldInnerHTML = domElement.innerHTML;
        const regexString = sentence.replace(new RegExp('[^a-zA-Z0-9]', 'g'), '.*?');
        var re = new RegExp(regexString);
        const newInnerHTML = oldInnerHTML.replace(re, replacer);
        domElement.innerHTML = newInnerHTML;
      }
    }
  });
}