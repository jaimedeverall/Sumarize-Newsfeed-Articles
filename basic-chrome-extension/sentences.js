console.log('reloading sentences');

const gist_sentences_identifier = 'gistsentences'
var is_news = false

//Gets called once on each page reload. This function takes care of loading highlights, sentences and user highlights.
function isNewsUrl(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'is_news_article', request_type: 'GET', parameters: details}, function(response) {
    is_news = JSON.parse(response)['is_news'];
    if (!is_news) { 
      $('.highlights_div').each(function(i, obj) {
        $(obj).hide();
      });
    }
  });
}

isNewsUrl(document.location.href);

chrome.runtime.sendMessage({get_open_tab_url: true}, function(response) {
  obj = JSON.parse(response);
  const is_tab_open = obj.is_tab_open;
  if(is_tab_open === true){
    saveTopSentences(obj.url);
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

function toggleHighlights(event) { 
  if (event.keyCode == 79) {  //'o' 
    $('.highlighted_sentence').each(function(i, obj) {
      $(obj).toggle(); 
    //test
    });
  }
}

document.onkeydown = toggleHighlights



