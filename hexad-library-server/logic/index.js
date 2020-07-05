module.exports = {
    // User- oriented functions
    registerUser: require('./register-user'),
    authenticateUser: require('./authenticate-user'),
    retrieveUser: require('./retrieve-user'),

    // Book-oriented functions
    addBooks: require('./add-books'),
    retrieveBooks: require('./retrieve-books'),
    updateBook: require('./update-book'),
    requestBook: require('./request-book'),
    removeBook: require('./remove-book'),
    borrowBook: require('./borrow-book'),
}