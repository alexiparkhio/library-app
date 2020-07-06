const {
    utils: { validate },
    errors: { NotFoundError, NotAllowedError }
} = require('hexad-library-commons');
const { models: { Admin, Book } } = require('hexad-library-data');

/***
 * Updated an existing Book on the database 
 * 
 * @param {string} adminId admin's unique ID
 * @param {object} bookData all book info to be added on the book creation
 * 
 * @returns {Promise<void>} returns an empty Promise on a successfull update
 * 
 * @throws {NotFoundError} if the admin or the book do not exist
 * 
 */
module.exports = (adminId, bookData) => {
    validate.string(adminId, 'adminId');
    validate.type(bookData, 'bookData', Object);
    validate.string(bookData.title, 'title');
    validate.string(bookData.ISBN, 'ISBN');
    validate.type(bookData.stock, 'stock', Number);
    validate.string(bookData.status, 'status');
    if (typeof bookData.description !== 'undefined') validate.string(bookData.description, 'description');
    if (typeof bookData.author !== 'undefined') validate.string(bookData.author, 'author');
    if (typeof bookData.yearOfPublication !== 'undefined') validate.type(bookData.yearOfPublication, 'yearOfPublication', Number);

    return (async () => {
        let [admin, book] = await Promise.all([Admin.findById(adminId), Book.findOne({ ISBN: bookData.ISBN })]);
        if (!admin) throw new NotFoundError(`admin with id ${adminId} does not exist`);
        if (!book) throw new NotFoundError(`book with ISBN ${bookData.ISBN} does not exist`);

        await Book.findOneAndUpdate({ ISBN: bookData.ISBN }, { $set: bookData });

        return;
    })();
}
