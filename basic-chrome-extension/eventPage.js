

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
    chrome.storage.sync.get("username", (user_name) => {
      var user_name = chrome.runtime.lastError ? null : user_name[user_name]
      if (user_name == null) { 
        user_name = ""
      }
      var parameter_string = parseRequest(request.parameters) + "&user_id=" + user_name
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
    });
  }
);
