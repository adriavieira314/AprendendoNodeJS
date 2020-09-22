if(process.env.NODE_ENV === 'production') {
    module.exports ={ mongoURI: 'mongo "mongodb+srv://nodejsnoyoutube.qvzmb.mongodb.net/blogapp" --username AdriaVieira'  }
} else {
    module.exports ={ mongoURI: 'mongodb://localhost/blogapp' }
}