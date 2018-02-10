package main

import ( 
	"net/http" 
	"encoding/json"
	"fmt"
	"strings"
	"strconv"
)

type Metadata struct{
	metric1 float32
	metric2 float32
	info1 string 
	info2 string
}

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
		line_number := r.FormValue("line_number")

		if (len(user_id) == 0) { http.Error(w, "Please pass in a user_id", http.StatusBadRequest) }
		if (len(line_number) == 0) { http.Error(w, "Please pass in a line_number", http.StatusBadRequest) }

		i_line_number, err := strconv.Atoi(line_number) 
		if (err != nil) {
			http.Error(w, "The line number wasn't an integer", http.StatusBadRequest)
		} else {
			insertNewHighlights(article_url, user_id, i_line_number)
		}
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


func main() {
	http.HandleFunc("/summary", summaryHandler)
	http.HandleFunc("/highlights", highlightsHandler) 
	http.HandleFunc("/metadata", metadataHandler) 
	fmt.Printf("Serving web pages on port 8080...\n")
	http.ListenAndServe(":8080", nil) 
}
