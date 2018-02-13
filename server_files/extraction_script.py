from newspaper import Article
import sys
import json

url = sys.argv[1]
article = Article(url)

article.download()
article.parse()
article.nlp()
#summary = article.summary
#full_text = article.text
article_data = {}
article_data["title"] = article.title
article_data["summary"] = article.summary
article_data["text"] = article.text
article_data["authors"] = article.authors
article_data["publish_date"] = str(article.publish_date)
article_data["num_images"] = str(len(article.images))

#print(str(article_data))
print(json.dumps(article_data))

