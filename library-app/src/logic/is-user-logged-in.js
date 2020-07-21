const context = require('./context');

/**
 * Function to evaluate if there is a current session open
 * 
 * @returns {boolean} either true or false if a token was found
 */
module.exports = function () {
    const { token } = this.storage;

    return !!token;
}.bind(context)