console.log('test.js')

function getHighlights(url){
  console.log('getting highlights');
  chrome.runtime.sendMessage({endpoint: "highlights", article_url: url}, function(response) {
    console.log(response)
  });
}


