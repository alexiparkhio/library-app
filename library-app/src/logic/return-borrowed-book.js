const fetch = require('./fetch');
const context = require('./context');
const { utils: { validate } } = require('library-commons');

/**
 * Returns a borrowed book by the member, and assess the resulting potential overdue penalty
 * 
 * @param {string} memberId member's unique ID
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful book return
 * 
 * @throws {NotFoundError} if the member or the book do not exist
 * @throws {NotFoundError} if the member does not have that book on their borrowedBooks array
 * 
*/
module.exports = function (ISBN) {
    validate.string(ISBN, 'ISBN');
    const { token } = this.storage;

    return (async() => await fetch.patch(`${this.API_URL}/return/${ISBN}`, undefined, token))();
}.bind(context)