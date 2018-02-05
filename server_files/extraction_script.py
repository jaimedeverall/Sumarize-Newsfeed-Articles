#!/usr/local/bin/python3.6
from newspaper import Article
import sys

url = sys.argv[1]
print(url)
article = Article(url)

article.download()
article.parse()
article.nlp()

print(article.summary)

