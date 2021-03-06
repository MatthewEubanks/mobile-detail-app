var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var authorSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: {
        type: String,
        unique: true
    }
});

var commentSchema = mongoose.Schema({ content: String });

var blogPostSchema = mongoose.Schema({
    title: String,
    content: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author"
    },
    picture: String,
    comments: [commentSchema]
});

blogPostSchema.pre('find', function(next) {
    this.populate('author');
    next();
});

blogPostSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
});

blogPostSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
    return {
        id: this._id,
        author: this.authorName,
        content: this.content,
        title: this.title,
        picture: this.picture,
        comments: this.comments
    };
};

var Author = mongoose.model('Author', authorSchema);

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {Author, BlogPost};