chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    if (request.endpoint === "summary" || request.endpoint === "highlights"){
      var xhr = new XMLHttpRequest();
      const requestUrl = "http://localhost:8080/" + request.endpoint + "?article_url=" + request.article_url
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