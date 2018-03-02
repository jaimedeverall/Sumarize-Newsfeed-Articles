var request = require('request');

var FLICKR_URL = 'https://api.flickr.com/services/rest/?';
var FLICKR_API_KEY = '3cffcc97867ea6aaf3d7fa2690f0ae10';
var STATUS_OK = 200

/**
 * Queries Flickr for photos that match the given query.
 *
 * @param query -- the search query to send to Flickr
 *
 * Calls @param callback(error, results):
 *  error -- the error that occurred or null if no error
 *  results -- if error is null, contains the search results
 */
module.exports.search = function(query, callback) {
	var params = {
		api_key: FLICKR_API_KEY,
		text: query,
		method: 'flickr.photos.search',
		format: 'json',
		media: 'photos',
		sort: 'relevance',
		nojsoncallback: 1
	}

	request.get({
		url: FLICKR_URL,
		qs: params
	}, function(error, response, body) {
		if (error) {
			callback(error)
		} else if (response.statusCode !== STATUS_OK) {
			callback(new Error('Received bad status code: ' + response.statusCode))
		} else {
			var photos = JSON.parse(body).photos.photo
			var formattedPhotos = []

			photos.forEach(function(photo) {
				var photoObject = {
					title: photo.title,
					source: 'https://farm' + photo.farm + '.staticflickr.com/' +
					photo.server + '/' + photo.id + '_' + photo.secret + '_z.jpg'
				}
				formattedPhotos.push(photoObject)
			})
			callback(null, formattedPhotos)
		}
	})
};
