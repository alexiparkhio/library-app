const { utils: { validate } } = require('hexad-library-commons');
const context = require('./context');
const fetch = require('./fetch');

/**
 * Toggles wishlist/unwishlist the specified book from the member's wishlistedBooks array
 * 
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful toggle
 * 
 * @throws {NotFoundError} if the member or the book do not exist
 * 
*/
module.exports = function (ISBN) {
    validate.string(ISBN, 'ISBN');

    return (async () => {
        const { token } = this.storage;

        debugger

        return await fetch.patch(`${this.API_URL}/wishlist/${ISBN}`, undefined, token)
    })()
}.bind(context)