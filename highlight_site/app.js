var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Post = require('./lib/post')

var STATUS_USER_ERROR = 422
var STATUS_OK = 200
var NUM_QUERIES = 3

// connect to database
mongoose.connect('mongodb://localhost:27017/callback-newsfeed-db');

var app = express();
// serve all files out of public folder
app.use(express.static('public'));

// parse json bodies in post requests
app.use(bodyParser.json());


// TODO: api routes
app.get('/search', function(request, response) {
	var query = request.query.q

	if (!query) {
		response.set('Content-type', 'text/plain')
		response.status(STATUS_USER_ERROR)
		response.send('No input given.')
	} else {
		var completedQueries = 0
		var compiledResults = []
		var soundcloud = require('./lib/soundcloud')
		var youtube = require('./lib/youtube')
		var flickr = require('./lib/flickr')

		soundcloud.search(query, function(error, results) {
			completedQueries++
			if (error) { throw error }
			else {
				if (results) {
					var bestMatch = results[0]
					bestMatch.api = 'soundcloud'
					compiledResults.push(bestMatch)
				}
				if (completedQueries === NUM_QUERIES) {
					response.set('Content-type', 'application/json')
      		response.status(STATUS_OK)
      		response.send(JSON.stringify(compiledResults))
				}
			}
		})

		youtube.search(query, function(error, results) {
			completedQueries++
			if (error) { throw error }
			else {
				if (results) {
					var bestMatch = results[0]
					bestMatch.api = 'youtube'
					compiledResults.push(bestMatch)
				}
				if (completedQueries === NUM_QUERIES) {
					response.set('Content-type', 'application/json')
      		response.status(STATUS_OK)
      		response.send(JSON.stringify(compiledResults))
				}
			}
		})

		flickr.search(query, function(error, results) {
			completedQueries++
			if (error) { throw error }
			else {
				if (results) {
					var bestMatch = results[0]
					bestMatch.api = 'flickr'
					compiledResults.push(bestMatch)
				}
				if (completedQueries === NUM_QUERIES) {
					response.set('Content-type', 'application/json')
      		response.status(STATUS_OK)
      		response.send(JSON.stringify(compiledResults))
				}
			}
		})
	}
})

app.get('/posts', function(request, response) {
	Post.find(function(error, people) {
		if (error) {
			throw error
		}
		response.set('Content-type', 'application/json')
    response.status(STATUS_OK)
    response.send(JSON.stringify(people))
	})
})

app.post('/posts', function(request, response) {
	var api = request.body.api
	var source = request.body.source
	var title = request.body.title
	if (!api || !source || !title) {
		response.set('Content-type', 'text/plain')
		response.status(STATUS_USER_ERROR)
		response.send("No input given")
	} else {
		var newPost = new Post({
			api: api,
			source: source,
			title: title,
			upvotes: 0
		})
		newPost.save(function(error) {
			if (error) {
				throw error
			}
		})
		response.set('Content-type', 'application/js')
		response.status(STATUS_OK)
		response.send(JSON.stringify(newPost))
	}
})

app.post('/posts/remove', function(request, response) {
	var id = request.body.id
	Post.findByIdAndRemove(id, function(error) {
		if (error) {
			throw error
		}
		response.status(STATUS_OK)
		response.send()
	})
})

app.post('/posts/upvote', function(request, response) {
	var id = request.body.id

	Post.findById(id, function(error, post) {
		console.log(JSON.stringify(post))
		if (error) {
			throw error
		}
		post.upvotes = post.upvotes + 1
		post.save(function(error) {
			if (error) {
				throw error
			}
			response.set('Content-type', 'application/js')
			response.status(STATUS_OK)
			response.send(JSON.stringify(post))
		})
	})
})


app.listen(3000);
console.log('Listening at 127.0.0.1:' + 3000);
