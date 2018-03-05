function parseRequest(request)  { 
  var parseStr = "";
  for (var key in request) {
    if (key == "request_type") {
      continue
    }
    parseStr += key + "=" + request[key]
    parseStr += "&"
  }
  if (parseStr) {
    parseStr = parseStr.substring(0, parseStr.length - 1)
  }
  return parseStr
}

// requires end point + parameters
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    var parameter_string = parseRequest(request.parameters)
    //var requestUrl = "http://localhost:8080/" + request.endpoint + "?" + parameter_string
    var requestUrl = "http://35.230.103.160:80/" + request.endpoint + "?" + parameter_string

    var xhr = new XMLHttpRequest();
    xhr.open(request.request_type, requestUrl, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        sendResponse(xhr.response);
      }
    }
    xhr.send();
    return true
  }
);
