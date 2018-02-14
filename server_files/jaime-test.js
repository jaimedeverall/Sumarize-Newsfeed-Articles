from newspaper import Article
import sys
import json

url = "https://www.vox.com/2018/2/6/16982370/trump-asked-the-pentagon-start-planning-a-military-parade"
article = Article(url)

article.download()
article.parse()
article.nlp()

highlights_data = {}
highlights_data["highlights"] = article.highlights

print(article.text)
print(article.html)