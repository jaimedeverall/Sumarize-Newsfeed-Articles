package main

import "os/exec"
import "encoding/json"
import "fmt"
import "strings"

func retrieveSummary(article_url string) map[string]interface{} {
	cmd := exec.Command("./extraction_script.py", article_url) 
	summary_bytes, _ := cmd.Output()

	raw := make( map[string]string )
	valid := json.Valid(summary_bytes)

	fmt.Println(valid)
	json.Unmarshal(summary_bytes, &raw)

	var newArticle Article

	newArticle.title = raw["title"]

	newArticle.summary = raw["summary"]
	newArticle.text = raw["text"]
	//newArticle.authors = raw["authors"].(string)
	newArticle.url = raw["url"]
	newArticle.publish_date = raw["publish_date"]

	allWords := strings.Split(newArticle.text, " ")
	num_words := len(allWords)

	newArticle.reputability = 0 
	newArticle.time_to_read = float64(num_words) / 275.0

	return map[string]interface{}{"author_reputability": newArticle.reputability, "time_to_read": newArticle.time_to_read, 
				"recap": newArticle.summary}
}

func writeMetadata(metadata Metadata) {
	
}
