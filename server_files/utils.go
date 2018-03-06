package main

import "os/exec"
import "encoding/json"
import "fmt"

func isNewsArticle(article_url string) map[string]interface{} {
	cmd := exec.Command("python3", "is_news_url.py", article_url)
	summary_bytes, _ := cmd.Output() 

	raw := make( map[string]interface{} )
	
	json.Unmarshal(summary_bytes, &raw)

	return raw 
}

func insertLog(user_id string, url string, log_type string) { 
	err := user_collection.Insert(&Log{News_url: url, 
		Log_type: log_type, User_id: user_id})
	if (err != nil) { 
		fmt.Println("Failed to record log\n")
	} else {
		fmt.Println("Log successfully recorded\n")
	}
}
