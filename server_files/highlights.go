package main

import "encoding/json"
import "os/exec"
import "fmt"

func retrieveHighlights(article_url string) map[string]interface{}{ 
	// find highlights. 
	
	// grab link, extract highlights 
	cmd := exec.Command("python3", "highlights_script.py", article_url) 
	summary_bytes, _ := cmd.Output()

	raw := make( map[string]interface{} )

	json.Unmarshal(summary_bytes, &raw)

	return raw
}

func retrieveTopSentences(article_url string) map[string]interface{} { 
	cmd := exec.Command("python3", "top_sentences_script.py", article_url) 
	summary_bytes, _ := cmd.Output()
	fmt.Println(string(summary_bytes))

	raw := make( map[string]interface{} )

	json.Unmarshal(summary_bytes, &raw)

	return raw
}

func insertNewHighlights(article_url string, user_id string, highlighted_string string) {
	fmt.Println("highlight string: " + highlighted_string + "\n")
	// 
}
