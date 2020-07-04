module.exports = {
    // User- oriented functions
    registerUser: require('./register-user'),
    authenticateUser: require('./authenticate-user'),

    // Book-oriented functions
    addBooks: require('./add-books'),
    retrieveBooks: require('./retrieve-books'),
}