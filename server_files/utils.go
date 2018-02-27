package main

import "os/exec"
import "encoding/json"

func isNewsArticle(article_url string) map[string]interface{} {
	cmd := exec.Command("python3", "is_news_url.py", article_url)
	summary_bytes, _ := cmd.Output() 

	raw := make( map[string]interface{} )
	
	json.Unmarshal(summary_bytes, &raw)

	return raw 
}
