console.log('test.js')

function getHighlights(url){
  console.log('getting highlights');
  chrome.runtime.sendMessage({endpoint: "highlights", request_type: "GET", parameters: {}}, function(response) {
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
      const selector = `h1:contains('${sentence}'), h2:contains('${sentence}'), h3:contains('${sentence}'), h4:contains('${sentence}'), h5:contains('${sentence}'), h6:contains('${sentence}'), p:contains('${sentence}')`;
      $(selector).each(function(index, element){
        console.log(element);
      })
    }
  });
}

getHighlights(document.URL);