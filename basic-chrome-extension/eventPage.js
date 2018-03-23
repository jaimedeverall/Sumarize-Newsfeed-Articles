function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

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
    }else if(request.get_current_tab_url === true){
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs){
        for(var i=0; i<tabs.length; i++){
          if(tabs[i].id === sender.tab.id){
            sendResponse(JSON.stringify({url: tabs[i].url}));
          }
        }
        sendResponse(JSON.stringify({}));
      });
      return true;
    }

    chrome.storage.sync.get("username", (user_name) => {
      var username = chrome.runtime.lastError ? null : user_name["username"]
      if (username == null) { 
        username = getRandomToken();

        chrome.storage.sync.set({"username":  username}, function() {
        });
      }

      var parameter_string = parseRequest(request.parameters) + "&user_id=" + username
      //var requestUrl = "http://35.185.247.13:80/" + request.endpoint + "?" + parameter_string
      var requestUrl = "http://localhost:8080/" + request.endpoint + "?" + parameter_string

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
