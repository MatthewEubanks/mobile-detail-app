const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
	title: {type: String, required: true},
	image: {type: String, required: true},
	content: {type: String, required: true},
	username: String
});

entrySchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		image: this.image,
		content: this.content,
		username: this.username
	};
};

const Entry = mongoose.model('Entry', entrySchema);
module.exports = {Entry};