from newspaper import Article
import sys
import json

url = sys.argv[1]
article = Article(url)

article.download()
article.parse()
article.nlp()

highlights_data = {}
highlights_data["highlights"] = article.highlights

print(json.dumps(highlights_data))
