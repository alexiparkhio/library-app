const { utils: { validate } } = require('hexad-library-commons');
const context = require('./context');
const fetch = require('./fetch');

/***
 * Updated an existing Book on the database 
 * 
 * @param {string} ISBN book's unique ISBN
 * 
 * @returns {Promise<void>} returns an empty Promise on a successfull remove
 * 
 * @throws {NotFoundError} if the admin or the book do not exist
 * 
 */
module.exports = function (ISBN) {
    validate.string(ISBN, 'ISBN');

    const { token } = this.storage;

    return (async() => await fetch.delete(`${this.API_URL}/book/${ISBN}`, token))();
}.bind(context)