const {
    utils: { validate },
    errors: { NotFoundError, NotAllowedError }
} = require('hexad-library-commons');
const { models: { Admin, Book, Member } } = require('hexad-library-data');

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
    validate.string(bookData.ISBN, 'ISBN');
    if (typeof bookData.description !== 'undefined') validate.string(bookData.description, 'description');
    if (typeof bookData.author !== 'undefined') validate.string(bookData.author, 'author');
    if (typeof bookData.yearOfPublication !== 'undefined') validate.type(bookData.yearOfPublication, 'yearOfPublication', Number);
    validate.type(stock, 'stock', Number);

    return (async () => {
        let [admin, book] = await Promise.all([Admin.findById(adminId), Book.findOne({ ISBN: bookData.ISBN })]);
        if (!admin) throw new NotFoundError(`admin with id ${adminId} does not exist`);

        if (book && book.title === bookData.title) {
            stock += book.stock;
            await Book.findOneAndUpdate({ ISBN: bookData.ISBN }, { $set: { stock } });

            return;
        } else if (book && book.title !== bookData.title) {
            throw new NotAllowedError(`book with title ${bookData.title} has a different ISBN`);

        } else if (!book) {

            bookData.stock = stock;
            bookData.added = new Date();
            book = await Book.create(bookData);

            await Admin.findByIdAndUpdate(adminId, { $addToSet: { addedBooks: book.id } });

            // Members who caused this book to be added get the bonus borrow limit, unless this bonus is already 4

            const [admins, members] = await Promise.all([
                Admin.find({ "requests.ISBN": bookData.ISBN }),
                Member.find({ "requestedBooks.ISBN": bookData.ISBN })
            ]);

            for (let i = 0; i < admins.length; i++) {
                await Admin.findByIdAndUpdate(admins[i].id, { $pull: { requests: { ISBN: bookData.ISBN } } });
            };

            for (let i = 0; i < members.length; i++) {
                const borrowLimit = members[i].borrowLimit === 4 ? 4 : members[0].borrowLimit + 1;
                await Member.findByIdAndUpdate(members[i].id, { $set: { borrowLimit }, $pull: { requestedBooks: { ISBN: bookData.ISBN } } });
            };

            return;
        }
    })();
}
