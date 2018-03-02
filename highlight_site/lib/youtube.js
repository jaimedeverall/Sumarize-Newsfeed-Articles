var request = require('request');

var YT_URL = 'https://www.googleapis.com/youtube/v3/search';
var YT_API_KEY = 'AIzaSyDDP01Gnj3-wfoqM59xQz6pryJQhmYWCt8';
var YT_EMBED_URL = 'http://www.youtube.com/embed/';
var STATUS_OK = 200

/**
 * Queries YouTube for videos that match the given query.
 *
 * @param query -- the search query to send to YouTube
 *
 * Calls @param callback(error, results):
 *  error -- the error that occurred or null if no error
 *  results -- if error is null, contains the search results
 */
module.exports.search = function(query, callback) {
	var params = {
		key: YT_API_KEY,
		q: query,
		part: 'snippet',
		type: 'video'
	}

	request.get({
		url: YT_URL,
		qs: params
	}, function(error, response, body) {
		if (error) {
			callback(error)
		} else if (response.statusCode !== STATUS_OK) {
			callback(new Error('Received bad status code: ' +
				response.statusCode))
		} else {
			var searchResults = JSON.parse(body).items
			var formattedVideos = []

			searchResults.forEach(function(searchResult) {
				var video = {
					title: searchResult.snippet.title,
					source: YT_EMBED_URL + searchResult.id.videoId
				}
				formattedVideos.push(video)
			})
			callback(null, formattedVideos)
		}
	})
};
