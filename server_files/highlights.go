package main


func retrieveHighlights(article_url string) map[int]interface{}{ 
	return map[int]interface{}{1: 0.3, 10: 0.6, 15: 0.8, 20: 0.3, 25: 0.6}
}

func insertNewHighlights(article_url string, user_id string, line_number int) {
	// 
}