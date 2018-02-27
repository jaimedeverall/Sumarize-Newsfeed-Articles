#from newspaper import 
import json 
import sys
from newspaper import urls


url = sys.argv[1]

is_news = urls.valid_url(url)

is_news_data = {}
is_news_data["is_news"] = is_news

print(json.dumps(is_news_data))