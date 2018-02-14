chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.endpoint === "summary"){
      var xhr = new XMLHttpRequest();
      const requestUrl = "http://localhost:8080/summary?article_url=" + request.article_url + "&source=facebook"
      xhr.open("GET", requestUrl, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          sendResponse(xhr.response);
        }
      }
      xhr.send();
    }
    return true
  }
);