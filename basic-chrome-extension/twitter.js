function getFinalUrl(key, url){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function(){
    console.log(xhr.responseURL);
  };
  xhr.send(null);
}