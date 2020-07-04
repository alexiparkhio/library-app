const {
    utils: { validate },
    errors: { NotFoundError, NotAllowedError }
} = require('hexad-library-commons');
const { models: { Admin, Book } } = require('hexad-library-data');

/***
 * Adds a new Book to the database or updates the stock of an already existing unit
 * 
 * @param {string} adminId admin's unique ID
 * @param {object} bookData all book info to be added on the book creation
 * @param {number} stock the amount of stock of that specific book to be added
 * 
 * @returns {Promise<void>} returns an empty Promise on a successfull creation/update
 * 
 * @throws {NotFoundError} if the admin does not exist
 * 
 */
module.exports = (adminId, bookData, stock) => {
    validate.string(adminId, 'adminId');
    validate.type(bookData, 'bookData', Object);
    validate.string(bookData.title, 'title');
    validate.type(bookData.idNumber, 'idNumber', Number);
    if (typeof bookData.description !== 'undefined') validate.string(bookData.description, 'description');
    if (typeof bookData.author !== 'undefined') validate.string(bookData.author, 'author');
    if (typeof bookData.yearOfPublication !== 'undefined') validate.type(bookData.yearOfPublication, 'yearOfPublication', Number);
    validate.type(stock, 'stock', Number);

    return (async () => {
        let [admin, book] = await Promise.all([Admin.findById(adminId), Book.findOne({ idNumber: bookData.idNumber })]);
        if (!admin) throw new NotFoundError(`admin with id ${adminId} does not exist`);

        if (book) {
            stock += book.stock;
            await Book.findOneAndUpdate({ idNumber: bookData.idNumber }, { $set: { stock } });

            return;
        } else {
            bookData.stock = stock;
            bookData.added = new Date();
            book = await Book.create(bookData);

            await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: book.id } });

            return;
        }
    })();
}
