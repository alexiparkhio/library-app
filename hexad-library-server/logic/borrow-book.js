const { models: { Member, Admin, Book } } = require('hexad-library-data');
const {
    errors: { NotFoundError, NotAllowedError },
    utils: { validate }
} = require('hexad-library-commons');
const { max } = Math;

/**
 * Allows a member to add a book on their borrow array, and creates an expiracy date to return it
 * 
 * @param {string} memberId member's unique ID
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

        if (member.borrowedBooks.length === member.borrowLimit) throw new NotAllowedError(`member with id ${memberId} already has the maximum amount of books borrowed`);

        const alreadyBorrowed = member.borrowedBooks.find(_book => _book.bookId.toString() === book.id.toString());

        if (alreadyBorrowed) throw new NotAllowedError(`book with ISBN ${ISBN} was already borrowed by member with id ${memberId}`);

        if (book.stock === 0) throw new NotAllowedError(`book with ISBN ${ISBN} is out of stock`);

        // Algorhythm to calculate the number of days for the book to be borrowed
        const daysCount = max(0.7 + 3 * member.borrowedBooks.length - member.overdueDays);
        const expiracyDate = new Date((new Date()).setDate((new Date()).getDate() + daysCount));
        const status = book.stock === 1 ? 'unavailable' : 'available';

        await Promise.all([
            Member.findByIdAndUpdate(memberId, { $addToSet: { borrowedBooks: { bookId: book.id, daysCount, expiracyDate } } }),
            Book.findOneAndUpdate({ ISBN }, { $set: { stock: --book.stock, status } })
        ]);

        const admins = await Admin.find();

        // Using a conventional for so we keep the async/await scope
        for (let i = 0; i < admins.length; i++) {
            await Admin.findByIdAndUpdate(admins[i].id, {
                $addToSet: {
                    rentedBooks: {
                        memberId, bookId: book.id, expiracyDate
                    }
                }
            });
        };

        return;
    })();
}