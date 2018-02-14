from newspaper import Article
import sys
import json

url = sys.argv[1]
article = Article(url)

article.download()
article.parse()
article.prepareSentenceHighlights()

print(json.dumps(article.top_sentences))
