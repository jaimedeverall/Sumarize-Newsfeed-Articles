#from newspaper import 
import url
import json 

url = sys.argv[1]

is_news = valid_url(url)

is_news_data = {}
is_news_data["is_news"] = is_news

print(json.dumps(is_news_data))