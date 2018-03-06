

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
    if(request.get_open_tab_url === true){
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs){
        var openTab = tabs[0]
        if(openTab.id === sender.tab.id){
          sendResponse(JSON.stringify({is_tab_open: true, url: openTab.url}));
        }else{
          sendResponse(JSON.stringify({is_tab_open: false}))
        }
      });
      return true;
    }

    chrome.storage.sync.get("username", (user_name) => {
      var user_name = chrome.runtime.lastError ? null : user_name[user_name]
      if (user_name == null) { 
        user_name = ""
      }
      var parameter_string = parseRequest(request.parameters) + "&user_id=" + user_name
    //var requestUrl = "http://localhost:8080/" + request.endpoint + "?" + parameter_string
      var requestUrl = "http://35.230.64.141:80/" + request.endpoint + "?" + parameter_string

      var xhr = new XMLHttpRequest();
      xhr.open(request.request_type, requestUrl, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          sendResponse(xhr.response);
        }
      }
      xhr.send();
    });
    return true; 
  }
);

// const gist_sentences_identifier = 'gistsentences'

// var tabToUrl = {};
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     // Note: this event is fired twice:
//     // Once with `changeInfo.status` = "loading" and another time with "complete"
//     tabToUrl[tabId] = tab.url;
// });

// chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
//     const url = tabToUrl[tabId];
//     const key = gist_sentences_identifier + '_' + url;
//     chrome.storage.sync.remove(key);
//     // Remove information for non-existent tab
//     delete tabToUrl[tabId];
// });
