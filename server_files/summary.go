package main

import "os/exec"
import "encoding/json"
import "fmt"
import "strings"
import "strconv"

func retrieveSummary(article_url string) map[string]interface{} {
	cmd := exec.Command("python3", "extraction_script.py", article_url) 
	summary_bytes, _ := cmd.Output()

	raw := make( map[string]interface{} )
	valid := json.Valid(summary_bytes)

	fmt.Println(valid)
	json.Unmarshal(summary_bytes, &raw)

	var newArticle Article

	newArticle.title = raw["title"].(string)
	fmt.Println("new article: " + newArticle.title)
	raw_summary := raw["summary"].([]interface{})
	s := make([]string, len(raw_summary))
	for i, v := range raw_summary {
    	s[i] = fmt.Sprint(v)
	}
	newArticle.summary = s//raw["summary"].([]string)

	newArticle.text = raw["text"].(string)
	fmt.Println("new article text: " + newArticle.text)
	//newArticle.authors = raw["authors"].(string)
	//newArticle.url = raw["url"].(string)
	//fmt.Println("url: " + newArticle.url)
	newArticle.publish_date = raw["publish_date"].(string)
	fmt.Println("publish_date: " + newArticle.publish_date)

	allWords := strings.Split(newArticle.text, " ")
	num_words := len(allWords)
	num_images, _ := strconv.Atoi(raw["num_images"].(string))

	newArticle.reputability = 0 
	newArticle.time_to_read = float64(num_words) / 275.0 + float64(num_images) * 0.15

	timeString := strconv.FormatFloat(newArticle.time_to_read, 'f', 2, 64)

	newArticleIdx := strings.Index(timeString, ".") 
	newArticleString := timeString[:newArticleIdx] + " minutes"

	return map[string]interface{}{"author_reputability": newArticle.reputability, "time_to_read": newArticleString, 
				"recap": newArticle.summary}
}

func writeMetadata(metadata Metadata) {
	
}
