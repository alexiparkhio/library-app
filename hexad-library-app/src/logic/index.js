module.exports = {
    context: require('./context'),
    fetch: require('./fetch'),
    isUserLoggedIn: require('./is-user-logged-in'),

    registerUser: require('./register-user'),
    authenticateUser: require('./authenticate-user'),
    retrieveUser: require('./retrieve-user'),
}