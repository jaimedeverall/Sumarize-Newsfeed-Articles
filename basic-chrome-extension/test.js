console.log('test.js')

function getHighlights(url){
  console.log('getting highlights');
  chrome.runtime.sendMessage({endpoint: "highlights", article_url: url}, function(response) {
    var obj = JSON.parse(response);
    var highlights = obj.highlights
    createHighlights(highlights);
  });
}

function createHighlights(highlights){
  Object.keys(highlights).forEach(function(key){
    const sentence = highlights[key][0]
    const score = highlights[key][1]
    if(sentence.length > 0){
      console.log(sentence);
      console.log(score);
      $(`p:contains('${sentence}')`).each(function(index, element){
        console.log(element);
      })
    }
  });
}

getHighlights(document.URL);


