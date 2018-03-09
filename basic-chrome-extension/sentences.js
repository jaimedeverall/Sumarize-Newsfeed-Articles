console.log('reloading sentences');

const gist_sentences_identifier = 'gistsentences';

var is_news = false

var highlights_on = false

var DATE_REGEX = /([\./\-_]{0,1}(19|20)\d{2})[\./\-_]{0,1}(([0-3]{0,1}[0-9][\./\-_])|(\w{3,5}[\./\-_]))([0-3]{0,1}[0-9][\./\-]{0,1})?/i

var ALLOWED_TYPES = ['html', 'htm', 'md', 'rst', 'aspx', 'jsp', 'rhtml', 'cgi', 'xhtml', 'jhtml', 'asp'];

var GOOD_PATHS = ['story', 'article', 'feature', 'featured', 'slides', 'slideshow', 'gallery', 'news', 'video', 'media', 'v', 'radio', 'press'];

var BAD_CHUNKS = ['careers', 'contact', 'about', 'faq', 'terms', 'privacy', 'advert', 'preferences', 'feedback', 'info', 'browse', 'howto', 'account', 'subscribe', 'donate', 'shop', 'admin'];

var BAD_DOMAINS = ['amazon', 'doubleclick', 'twitter'];

// chrome.runtime.sendMessage({get_open_tab_url: true}, function(response) {
//   obj = JSON.parse(response);
//   const is_tab_open = obj.is_tab_open;
//   const url = obj.url;
//   if(is_tab_open === true && document.URL === url){
//     console.log('url', url);
//     saveTopSentences(url);
//   }
// });

//Runs once upon each page reload.
chrome.runtime.sendMessage({get_current_tab_url: true}, function(response) {
  obj = JSON.parse(response);
  const url = obj.url;

  if(url === undefined){
    return;
  }

  if(is_news_article(url)){
    addHighlightsButton(url);
  }
});

//Gets called once on each page reload. This function takes care of loading highlights, sentences and user highlights.
function isNewsUrl(url){
  var details = {article_url: url}
  chrome.runtime.sendMessage({endpoint: 'is_news_article', request_type: 'GET', parameters: details}, function(response) {
    is_news = JSON.parse(response)['is_news'];
    highlights_on = is_news
    if (is_news == false) { 
      $('.highlighted_sentence').each(function(i, obj) {
        $(obj).css("background-color", "transparent")
      });
    }
  });
}

function addHighlightsButton(url){
  $('.highlights_button').remove();

  const firstH1 = $(document.body).find('h1').get(0);

  if(firstH1 === undefined){ //if there is no header we will assume it's not a news article.
    return;
  }

  const buttonH1 = createButton('h1');

  buttonH1.style.backgroundColor = 'red';

  buttonH1.onclick = function(e){
    toggleSentences(buttonH1, url);
  }

  document.body.appendChild(buttonH1);

  const posH1 = $(firstH1).offset();

  positionHighlightsButton(buttonH1, posH1);

}

function toggleSentences(button, url){
  const key = gist_sentences_identifier + '_' + url;
  const topSentences = JSON.parse(window.sessionStorage.getItem(key));

  if(button.style.backgroundColor === 'green'){
    $('.highlighted_sentence').each(function(index, element){
      element.style.backgroundColor = 'transparent';
    })
    button.style.backgroundColor = 'red';
    return;
  }

  button.style.backgroundColor = 'green';

  if(topSentences === null){//not in the cache.
    chrome.runtime.sendMessage({get_current_tab_url: true}, function(response) {
      const url = JSON.parse(response).url;
      saveTopSentences(url);
    });
  }else{
    const highlights_inserted = $('.highlighted_sentence').find().get(0);
    if(highlights_inserted === undefined){//in the cache but not in the DOM.
      highlightTopSentences(topSentences);
    }else{//in the cache, already in the DOM.
      $('.highlighted_sentence').each(function(index, element){
        element.style.backgroundColor = '#98FB98';
      })
    }
  }
}

function positionHighlightsButton(button, position){
  $(button).css({left: position.left, top: position.top});
}

// $(window).bind('resize', function(e) {
//   addHighlightsButton(url);
// });

function is_news_article2(url){
  return true;
}

function is_news_article(url){
  /*
  Is this URL a valid news-article url?

  Perform a regex check on an absolute url.

  First, perform a few basic checks like making sure the format of the url
  is right, (scheme, domain, tld).

  Second, make sure that the url isn't some static resource, check the
  file type.

  Then, search of a YYYY/MM/DD pattern in the url. News sites
  love to use this pattern, this is a very safe bet.

  Separators can be [\.-/_]. Years can be 2 or 4 digits, must
  have proper digits 1900-2099. Months and days can be
  ambiguous 2 digit numbers, one is even optional, some sites are
  liberal with their formatting also matches snippets of GET
  queries with keywords inside them. ex: asdf.php?topic_id=blahlbah
  We permit alphanumeric, _ and -.

  Our next check makes sure that a keyword is within one of the
  separators in a url (subdomain or early path separator).
  cnn.com/story/blah-blah-blah would pass due to "story".

  We filter out articles in this stage by aggressively checking to
  see if any resemblance of the source& domain's name or tld is
  present within the article title. If it is, that's bad. It must
  be a company link, like 'cnn is hiring new interns'.

  We also filter out articles with a subdomain or first degree path
  on a registered bad keyword.
  */

  //If we are testing this method in the testing suite, we actually
  //need to preprocess the url like we do in the article's constructor!
  //if test:
    //url = prepare_url(url)

    //11 chars is shortest valid url length, eg: http://x.co
    if(url === undefined || url.length < 11){
      if(verbose){
        console.log('url rejected because of length', url);
      }
      return false
    }

    r1 = url.includes('mailto:');
    r2 = !(url.includes('http://') || url.includes('https://'));

    if(r1===true || r2===true){
      if(verbose){
        console.log('url rejected because of url structure', url);
      }
      return false
    }
    ///www.google.com/this/is/extra.html
    var parsedUrl = new URL(url);

    var path = parsedUrl.pathname;

    //input url is not in valid form (scheme, netloc, tld)
    if(path === undefined || path[0] !== '/'){
      if(verbose){
        console.log('url rejected because of missing start slash', url);
      }
      return false
    }

    //the '/' which may exist at the end of the url provides us no information
    if(path[path.length - 1] === '/'){
      path = path.substring(0, path.length-1);
    }

    //'/story/cnn/blahblah/index.html' --> ['story', 'cnn', 'blahblah', 'index.html']
    var path_chunks = [];
    var arr = path.split('/');
    for(var i=0; i<arr.length; i++){
      if(arr[i].length > 0){
        path_chunks.push(arr[i].toLowerCase());
      }
    }

    //path_chunks = [x for x in path.split('/') if len(x) > 0]

    //siphon out the file type. eg: .html, .htm, .md
    if(path_chunks.length > 0){
      const file_type = url_to_filetype(url);
      if(file_type !== null && !ALLOWED_TYPES.includes(file_type)){
        if(verbose){
          console.log('url rejected due to bad file type', url, file_type);
        }
        return false
      }

      var last_chunk = path_chunks[path_chunks.length - 1].split('.');
      if(last_chunk.length > 1){
        path_chunks[path_chunks.length - 1] = last_chunk[0];
      }
    }

    //got up to here

    //Index gives us no information
    var new_path_chunks = [];
    for(var i=0; i<path_chunks.length; i++){
      if(path_chunks[i] !== 'index'){
        new_path_chunks.push(path_chunks[i]);
      }
    }
    path_chunks = new_path_chunks;

    const subdomain_regex = /(?:http[s]*\:\/\/)*(.*?)\.(?=[^\/]*\..{2,5})/i
    //TODO finish domain_regex
    const domain_regex = /.*([^\.]+)(com|net|org|info|coop|int|co\.uk|org\.uk|ac\.uk|uk)/i

    var subd = url.match(subdomain_regex)
    var tld = url.match(domain_regex) 

    if (tld !== null) { 
      tld = tld[0].toLowerCase()
      if (BAD_DOMAINS.includes(tld)) { 
        return false
      }
    }

    var url_slug = ''
    if (path_chunks.length > 0) { 
      url_slug = path_chunks[path_chunks.length-1]
    }

    var dash_count = 0
    var underscore_count = 0

    if (path_chunks.length > 0) { 
      dash_count = (url_slug.match(/-/g) || []).length
      underscore_count = (url_slug.match(/_/g) || []).length
    }

    if (url_slug.length > 0 && (dash_count > 4 || underscore_count > 4)) {
      if (dash_count >= underscore_count) { 
        var dash_split = url_slug.split('-')
        for (var i = 0; i < dash_split.length; i++) { 
          dash_split[i] = dash_split[i].toLowerCase()
        }
        if (dash_split.includes(tld)) {
          return true
        }
      }

      if (underscore_count > dash_count) { 
        var underscore_split = url_slug.split('_')
        for (var i = 0; i < underscore_split.length; i++) { 
          underscore_split[i] = underscore_split[i].toLowerCase()
        }
        if (underscore_split.includes(tld)) {
          return true
        }
      }
    }

    if (path_chunks.length <= 1) {
      if(verbose){
        console.log(url + " caught for path chunks too small");
      }
      return false
    }

    if (subd !== null) {
      subd = subd[0].toLowerCase() 
      if (BAD_CHUNKS.includes(subd)) {
        if (verbose) {
          console.log(url + " subdomain has bad chunks.")
        }
        return false
      }

      for (var i = 0; i < BAD_CHUNKS.length; i++) { 
        if (path_chunks.includes(BAD_CHUNKS[i])) { 
          if (verbose) { 
            console.log(url + " caught for bad chunks in path_chunks")
          }
          return false
        }
      }
    }

    var match_date = url.match(DATE_REGEX)

    if (match_date !== null) {
      if (verbose) { 
        console.log(url + " verified for date.")
      }
      return true
    }

    for (var i = 0; i < GOOD_PATHS.length; i++) { 
      if (path_chunks.includes(GOOD_PATHS[i])) { 
        if (verbose){
          console.log(url + " verified for good path.")
        }
        return true
      }
    }

    if (verbose) {
      console.log(url + ' caught for default false')
    }
    return false
}

function url_to_filetype(abs_url){
  /*
    Input a URL and output the filetype of the file
    specified by the url. Returns None for no filetype.
    'http://blahblah/images/car.jpg' -> 'jpg'
    'http://yahoo.com'               -> null
  */
  var path = new URL(abs_url).pathname;

  //Eliminate the trailing '/', we are extracting the file
  if(path[path.length - 1] === '/'){
    path = path.substring(0, path.length-1);
  }

  var path_chunks = [];
  var arr = path.split('/');
  for(var i=0; i<arr.length; i++){
    if(arr[i].length > 0){
      path_chunks.push(arr[i].toLowerCase());
    }
  }

  if(path_chunks.length === 0){
    return null;
  }

  //split.pop().split('#|?/')[0];

  var last_chunks = path_chunks[path_chunks.length - 1].split('.');

  if(last_chunks.length < 2){
    return null;
  }
  //last_chunks = [index, html#blahblah].
  var last_chunk_arr = last_chunks.pop().split(/#|?/);

  if(last_chunk_arr.length === 0){
    return null;
  }
  //[index, html#blahblah] -> html
  const file_type = last_chunk_arr[0];

  if(file_type.length <= 5 || ALLOWED_TYPES.includes(file_type.toLowerCase())){
    return file_type.toLowerCase();
  }

  return null;
}

function createButton(text){
  var button = document.createElement('div');
  button.style.width = '25px';
  button.style.height = '25px';
  button.innerHTML = text;
  button.setAttribute('class', 'highlights_button');
  return button;
}

//Gets called once on each page reload.
function saveTopSentences(url){
  const key = gist_sentences_identifier + '_' + url;
  var details = {article_url: url};
  chrome.runtime.sendMessage({endpoint: 'top_sentences', request_type: 'GET', parameters: details}, function(response) {
    var topSentencesRes = JSON.parse(response);
    var topSentences = formatResponse(topSentencesRes);
    if(topSentences.length === 0){
      return;
    }
    window.sessionStorage.setItem(key, JSON.stringify(topSentences));
    highlightTopSentences(topSentences);
  });
}

function formatResponse(topSentencesRes){
  var topSentences = []
  Object.keys(topSentencesRes).forEach(function(key){
    topSentences.push(key);
  })
  return topSentences;
}

function replacer(match){
  return "<span class='highlighted_sentence'>" + match + "</span>";
}

function highlightTopSentences(topSentences){
  console.log('length', topSentences.length);
  for(var i=0; i<topSentences.length; i++){
    const sentence = topSentences[i];

    if(sentence.length === 0){
      continue;
    }

    const selector = `:contains('${sentence}')`;
    var domElement = $(selector).get(-1); //gets the last matched element i.e. the element closest to the text.

    if(domElement === undefined){
      continue;
    }

    const oldInnerHTML = domElement.innerHTML;
    const regexString = sentence.replace(new RegExp('[^a-zA-Z0-9]', 'g'), '.*?');
    var re = new RegExp(regexString);
    const newInnerHTML = oldInnerHTML.replace(re, replacer);
    domElement.innerHTML = newInnerHTML;
  }
}

function toggleHighlights(event) { 
  if (event.keyCode == 79) {  //'o' 
    $('.highlighted_sentence').each(function(i, obj) {
      if (highlights_on) {
        $(obj).css("background-color", "transparent")
        //$(obj).effect("highlight", { color: "#ffffff" }, 3000);
      } else {
        $(obj).css("background-color", "#98FB98")
      }      
    });
  }
  highlights_on = !highlights_on
}

document.onkeydown = toggleHighlights



