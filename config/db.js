if(process.env.NODE_ENV === 'production') {
    module.exports ={ mongoURI: 'mongodb+srv://AdriaVieira:<123456>@nodejsnoyoutube.qvzmb.mongodb.net/blogapp?retryWrites=true&w=majority'  }
} else {
    module.exports ={ mongoURI: 'mongodb://localhost/blogapp' }
}