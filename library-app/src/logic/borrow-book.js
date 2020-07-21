const { utils: { validate } } = require('library-commons');
const context = require('./context');
const fetch = require('./fetch');

/**
 * Allows a member to add a book on their borrow array, and creates an expiracy date to return it
 * 
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful request
 * 
 * @throws {NotFoundError} if the member or the book do not exist
 * @throws {NotAllowedError} if the member already has all available books borrowed
 * @throws {NotAllowedError} if the member already has that specific book borrowed
 * @throws {NotAllowedError} if the book has an stock of 0
 * 
*/
module.exports = function (ISBN) {
    validate.string(ISBN, 'ISBN');

    const { token } = this.storage;

    return (async () => await fetch.patch(`${this.API_URL}/borrow/${ISBN}`, undefined, token))()
}.bind(context)