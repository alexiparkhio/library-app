module.exports = {
    // User-oriented handlers
    registerUser: require('./register-user'),
    authenticateUser: require('./authenticate-user'),

    // Book-oriented handlers
    addBooks: require('./add-books'),
    retrieveBooks: require('./retrieve-books'),
}