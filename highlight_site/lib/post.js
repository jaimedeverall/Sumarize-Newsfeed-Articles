var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
	api: String,
	source: String,
	title: String,
	upvotes: Number
})

var Post = mongoose.model('Post', postSchema)
module.exports = Post

// TODO
