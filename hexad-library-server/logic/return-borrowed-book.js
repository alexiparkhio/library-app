const { models: { Member, Admin, Book } } = require('hexad-library-data');
const {
    errors: { NotFoundError, NotAllowedError },
    utils: { validate }
} = require('hexad-library-commons');

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
module.exports = (memberId, ISBN) => {
    validate.string(memberId, 'memberId');
    validate.string(ISBN, 'ISBN');

    return (async () => {
        const [member, book] = await Promise.all([
            Member.findById(memberId),
            Book.findOne({ ISBN })
        ]);

        if (!member) throw new NotFoundError(`member with id ${memberId} does not exist`);
        if (!book) throw new NotFoundError(`book with ISBN ${ISBN} does not exist`);

        const borrowedBook = member.borrowedBooks.find(_book => _book.bookId.toString() === book.id.toString());
        if (!borrowedBook) throw new NotFoundError(`book with ISBN ${ISBN} was not found on the borrowed books from member with id ${memberId}`);

        // Assessment of the potential overdue days penalty
        let overdueDays = parseFloat(((borrowedBook.expiracyDate - new Date()) / (1000 * 60 * 60 * 24)).toFixed(2));
        overdueDays = overdueDays < 0 ? member.overdueDays + overdueDays * -1 : member.overdueDays;

        await Member.findByIdAndUpdate(memberId, { $pull: { borrowedBooks: { bookId: book.id } }, $set: { overdueDays } });

        // Setting the stock again
        const stock = book.stock + 1;
        const status = 'available';
        await Book.findByIdAndUpdate(book.id, { $set: { stock, status } });

        // Using a conventional for so that the original scope of async/await is not lost
        const admins = await Admin.find();
        for (let i = 0; i < admins.length; i++) {
            await Admin.findByIdAndUpdate(admins[i].id, { $pull: { rentedBooks: { memberId, bookId: book.id } } });
        };

        return;
    })();
}