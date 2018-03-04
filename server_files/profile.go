package main
import "gopkg.in/mgo.v2/bson"

func retrieveNewsArticles(user_id string) map[string]interface{} {
	// return back an array of items 
	var results []Highlight 
	err := user_collection.Find(bson.M{"user_id": user_id}).All(&results) 

	if (err != nil) { 
		return map[string]interface{}{}
	}

	var stringedResults []string 
	var curr_string string 
	for i:= 0; i < len(results); i++ {
		curr_string = results[i].News_url + ";" + results[i].Highlight_line + ";" + results[i].Time
		stringedResults = append(stringedResults, curr_string)
	}

	return map[string]interface{}{"reading_items": stringedResults}
}
