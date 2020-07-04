const {
    utils: { validate },
    errors: { NotFoundError, NotAllowedError }
} = require('hexad-library-commons');
const { models: { Admin, Book, Member } } = require('hexad-library-data');

/***
 * Updated an existing Book on the database 
 * 
 * @param {string} adminId admin's unique ID
 * @param {string} ISBN book's unique ISBN
 * 
 * @returns {Promise<void>} returns an empty Promise on a successfull remove
 * 
 * @throws {NotFoundError} if the admin or the book do not exist
 * 
 */
module.exports = (adminId, ISBN) => {
    validate.string(adminId, 'adminId');
    validate.string(ISBN, 'ISBN');
    return (async () => {
        let [admin, book] = await Promise.all([
            Admin.findById(adminId),
            Book.findOne({ ISBN })
        ]);
        if (!admin) throw new NotFoundError(`admin with id ${adminId} does not exist`);
        if (!book) throw new NotFoundError(`book with ISBN ${ISBN} does not exist`);

        const [admins, members] = await Promise.all([
            Admin.find({ $or: [{ 'addedBooks': book.id }, { rentedBooks: { bookId: book.id } }] }),
            Member.find({ borrowedBooks: { bookId: book.id } })
        ]);

        // Using a conventional for in order to avoid a different async/await scope
        for (let i = 0; i < admins.length; i++) {
            await Admin.findByIdAndUpdate(admins[i].id, { $pull: { addedBooks: book.id, rentedBooks: { bookId: book.id } } })
        };

        for (let i = 0; i < members.length; i++) {
            await Member.findByIdAndUpdate(members[i].id, { $pull: { borrowedBooks: { bookId: book.id } } })
        };

        await Book.findByIdAndRemove(book.id);

        return;
    })();
}
