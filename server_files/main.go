package main

import ( 
	"net/http" 
	"encoding/json"
	"fmt"
	"strings"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"github.com/rs/cors"
)

type Metadata struct{
	metric1 float32
	metric2 float32
	info1 string 
	info2 string
}

type Highlight struct {
	ID        bson.ObjectId `bson:"_id,omitempty"`
	News_url string 
	Highlight_line string
	User_id string
	Time string
}

type Log struct {
	ID        bson.ObjectId `bson:"_id,omitempty"`
	News_url string 
	Log_type string
	User_id string
}


var user_collection *mgo.Collection 
var logging_data *mgo.Collection

// formatRequest generates ascii representation of a request (for debugging purposes)
func formatRequest(r *http.Request) string {
	// Create return string
	var request []string
	// Add the request string
	url := fmt.Sprintf("%v %v %v", r.Method, r.URL, r.Proto)
	request = append(request, url)
	// Add the host
	request = append(request, fmt.Sprintf("Host: %v", r.Host))
	// Loop through headers
	for name, headers := range r.Header {
		name = strings.ToLower(name)
		for _, h := range headers {
			request = append(request, fmt.Sprintf("%v: %v", name, h))
		}
	 }
	 
	 // If this is a POST, add post data
	 if r.Method == "POST" {
	 	r.ParseForm()
	 	request = append(request, "\n")
	 	request = append(request, r.Form.Encode())
	 } 
	 // Return the request as a string
	 return strings.Join(request, "\n")
}

func summaryHandler(w http.ResponseWriter, r *http.Request) {
	if (r.Method == "GET") {
		article_url := r.FormValue("article_url")

		if (strings.Compare(r.FormValue("source"), "facebook") == 0) {
			if (strings.Compare(article_url[:len("https://l.facebook.com/l.php?u=")], "https://l.facebook.com/l.php?u=") == 0) { 
				article_url = article_url[len("https://l.facebook.com/l.php?u="):]
			}
		}
		fmt.Printf(article_url)
		if (len(article_url) == 0) {
			http.Error(w, "Please pass in an article_url", http.StatusBadRequest)
		} else {
			w.Header().Set("Content-Type", "application/json")
			request_body := retrieveSummary(article_url) 
			json.NewEncoder(w).Encode(request_body)
		}
	} else {
		http.Error(w, "This address only accepts GET responses", http.StatusNotAcceptable)
	}
}


func highlightsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Received highlights request")
	article_url := r.FormValue("article_url") 
	if (len(article_url) == 0) {
		http.Error(w, "Please pass in an article_url", http.StatusBadRequest)
	}

	if (r.Method == "GET") { 
		w.Header().Set("Content-Type", "application/json")
		highlights := retrieveHighlights(article_url) 
		json.NewEncoder(w).Encode(highlights)
	} else if (r.Method=="POST") {
		user_id := r.FormValue("user_id")
		highlight := r.FormValue("highlight")



		if (len(user_id) == 0) { http.Error(w, "Please pass in a user_id", http.StatusBadRequest) }
		insertNewHighlights(article_url, user_id, highlight)
	} else {
		http.Error(w, "This address only accepts GET responses", http.StatusNotAcceptable)
	}
}

func metadataHandler(w http.ResponseWriter, r *http.Request) {
	if (r.Method == "POST") {
		article_url := r.FormValue("article_url") 
		user_id := r.FormValue("line_number") 
		
		if (len(article_url) == 0) { http.Error(w, "Please pass in an article_url", http.StatusBadRequest) }
		if (len(user_id) == 0) { http.Error(w, "Please pass in a user_id", http.StatusBadRequest) }

		if r.Body == nil {
			http.Error(w, "Please send a request body", http.StatusBadRequest)
			return
		}
		var data Metadata
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		writeMetadata(data)
	} else {
		http.Error(w, "This address only accepts GET responses", http.StatusNotAcceptable)
	}
}

func topSentenceHandler(w http.ResponseWriter, r *http.Request) {
	if (r.Method == "GET") {
		article_url := r.FormValue("article_url")
		/*if (strings.Compare(r.FormValue("source"), "facebook")) {
			article_url = article_url[len("https://l.facebook.com/l.php?u="):]
		}*/
		fmt.Printf(article_url)
		if (len(article_url) == 0) {
			http.Error(w, "Please pass in an article_url", http.StatusBadRequest)
		} else {
			w.Header().Set("Content-Type", "application/json")
			request_body := retrieveTopSentences(article_url) 
			json.NewEncoder(w).Encode(request_body)
		}
	} else {
		http.Error(w, "This address only accepts GET responses", http.StatusNotAcceptable)
	}
}

func isNewsArticleHandler(w http.ResponseWriter, r *http.Request) { 
	article_url := r.FormValue("article_url")
	if (len(article_url) == 0) { 
		http.Error(w, "Please pass in an article_url", http.StatusBadRequest)
	} else { 
		w.Header().Set("Content-Type", "application/json")
		request_body := isNewsArticle(article_url)
		json.NewEncoder(w).Encode(request_body)
	}
}

func getNewsArticles(w http.ResponseWriter, r *http.Request) { 
	user_id := r.FormValue("user_id")
	if (len(user_id) == 0) { 
		http.Error(w, "Please pass in the author", http.StatusBadRequest)
	} else {
		w.Header().Set("Content-Type", "application/json") 
		request_body := retrieveNewsArticles(user_id) 
		json.NewEncoder(w).Encode(request_body)
	}
}

func processLog(w http.ResponseWriter, r *http.Request) { 
	user_id := r.FormValue("user_id")
	url := r.FormValue("url") 
	log_type := r.FormValue("type")
	fmt.Println("user_id: " + user_id)
	fmt.Println("url: " + url)
	fmt.Println("log_type" + log_type)

	insertLog(user_id, url, log_type)
}

func main() {
	mux := http.NewServeMux() 

	mux.HandleFunc("/summary", summaryHandler)
	mux.HandleFunc("/highlights", highlightsHandler) 
	mux.HandleFunc("/metadata", metadataHandler) 
	mux.HandleFunc("/top_sentences", topSentenceHandler)
	mux.HandleFunc("/is_news_article", isNewsArticleHandler)
	mux.HandleFunc("/get_articles", getNewsArticles)
	mux.HandleFunc("/logging", processLog)
	mux.Handle("/", http.FileServer(http.Dir("../highlight_webpage")))
	

	session, err := mgo.Dial("localhost")
	if (err != nil) { 
		fmt.Printf("Failed to connect mongodb: " + err.Error() + "\n")
	} else {
		fmt.Printf("Successfully connected to mongodb")
	}

	user_collection = session.DB("user_info").C("highlights")
	logging_data = session.DB("user_info").C("data_logs")
	fmt.Printf("Serving web pages on port 80...\n")

	handler := cors.Default().Handler(mux)

	error := http.ListenAndServe(":8080", handler)
	fmt.Println(error) 
}
