package main

import "encoding/json"
import "os/exec"

func retrieveHighlights(article_url string) map[string]interface{}{ 
	// find highlights. 
	
	// grab link, extract highlights 
	cmd := exec.Command("python3", "highlights_script.py", article_url) 
	summary_bytes, _ := cmd.Output()

	raw := make( map[string]interface{} )

	json.Unmarshal(summary_bytes, &raw)

	return raw
}

func insertNewHighlights(article_url string, user_id string, line_number int) {
	// 
}
