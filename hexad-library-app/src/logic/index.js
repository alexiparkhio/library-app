module.exports = {
    context: require('./context'),
    fetch: require('./fetch'),
    isUserLoggedIn: require('./is-user-logged-in'),
    
    registerUser: require('./register-user'),
    authenticateUser: require('./authenticate-user'),
    retrieveUser: require('./retrieve-user'),
    toggleWishlist: require('./toggle-wishlist'),
    
    addBooks: require('./add-books'),
    removeBook: require('./remove-book'),
    retrieveBooks: require('./retrieve-books'),
    requestBook: require('./request-book'),
    borrowBook: require('./borrow-book'),

}