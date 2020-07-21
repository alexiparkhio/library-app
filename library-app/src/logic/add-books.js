const { utils: { validate } } = require('library-commons');
const context = require('./context');
const fetch = require('./fetch');

/***
 * Adds a new Book to the database or updates the stock of an already existing unit
 * 
 * @param {object} bookData all book info to be added on the book creation
 * 
 * @returns {Promise<void>} returns an empty Promise on a successfull creation/update
 * 
 * @throws {NotFoundError} if the admin does not exist
 * 
 */
module.exports = function (bookData) {
    validate.type(bookData, 'bookData', Object);
    validate.string(bookData.title, 'title');
    validate.string(bookData.ISBN, 'ISBN');
    validate.type(bookData.stock, 'stock', Number);
    if (typeof bookData.description !== 'undefined') validate.string(bookData.description, 'description');
    if (typeof bookData.author !== 'undefined') validate.string(bookData.author, 'author');
    if (typeof bookData.yearOfPublication !== 'undefined') validate.type(bookData.yearOfPublication, 'yearOfPublication', Number);

    const { token } = this.storage;
    debugger
    return (async() => await fetch.post(`${this.API_URL}/add-book`, bookData, token))();
}.bind(context)