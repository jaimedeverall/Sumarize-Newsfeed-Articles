package main

import "encoding/json"
import "os/exec"
import "fmt"
import "time"

func retrieveHighlights(article_url string) map[string]interface{}{ 
	// find highlights. 
	
	// grab link, extract highlights 
	cmd := exec.Command("python3", "highlights_script.py", article_url) 
	summary_bytes, _ := cmd.Output()

	raw := make( map[string]interface{} )

	json.Unmarshal(summary_bytes, &raw)

	return raw
}

func retrieveTopSentences(article_url string, user_id string) map[string]interface{} { 
	sentences_toggle.Insert(&Sentences{User_id: user_id, Switch: "On", Article_url: article_url})
	cmd := exec.Command("python3", "top_sentences_script.py", article_url) 
	summary_bytes, _ := cmd.Output()
	fmt.Println(string(summary_bytes))

	raw := make( map[string]interface{} )

	json.Unmarshal(summary_bytes, &raw)

	return raw
}

func insertNewHighlights(article_url string, user_id string, highlighted_string string) {
	err := user_collection.Insert(&Highlight{News_url: article_url, 
		Highlight_line: highlighted_string, User_id: user_id, Time: time.Now().String()})
	if (err != nil) { 
		fmt.Println("Failed to insert string\n")
	} else {
		fmt.Println("highlight string: " + highlighted_string + "successfully inserted. \n")
	}
}
