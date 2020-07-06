const { utils: { validate } } = require('hexad-library-commons');
const context = require('./context');
const fetch = require('./fetch');

/**
 * Creates a new book request, with a member ID and an specified ISBN to be requested to the admin users
 * 
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful request
 * 
 * @throws {NotFoundError} if the member does not exist
 * 
*/
module.exports = function (ISBN) {
    validate.string(ISBN, 'ISBN');

    const { token } = this.storage;

    debugger

    return (async () => await fetch.post(`${this.API_URL}/request`, ISBN, token))();
}.bind(context)