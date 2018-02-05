package main

import "os/exec"

func retrieveSummary(article_url string) map[string]interface{} {
	cmd := exec.Command("./extraction_script.py", article_url) 
	summary_bytes, err := cmd.Output()
	summary := string(summary_bytes)

	if (err != nil) {
		summary = "Unable to generate summary."
	}
	return map[string]interface{}{"author_reputability": 0.7, "time_to_read": 0.5, "recap": summary}
}

func writeMetadata(metadata Metadata) {
	
}
