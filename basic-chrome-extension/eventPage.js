chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    var requestUrl = "http://localhost:8080/" + request.endpoint + "?article_url=" + request.article_url
    if (request.endpoint === "summary"){
      requestUrl += "&source=" + request.source;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        sendResponse(xhr.response);
      }
    }
    xhr.send();
    return true
  }
);