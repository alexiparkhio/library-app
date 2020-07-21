const { models: { Member, Book } } = require('library-data');
const {
    errors: { NotFoundError, NotAllowedError },
    utils: { validate }
} = require('library-commons');

/**
 * Toggles wishlist/unwishlist the specified book from the member's wishlistedBooks array
 * 
 * @param {string} memberId member's unique ID
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful toggle
 * 
 * @throws {NotFoundError} if the member or the book do not exist
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

        // Evaluation if the book is already wishlisted. In that case, it will be unwishlisted
        if (member.wishlistedBooks.find(wishlistedBook => wishlistedBook.toString() === book.id.toString())) {
            await Member.findByIdAndUpdate(memberId, { $pull: { wishlistedBooks: book.id } });
        } else {
            await Member.findByIdAndUpdate(memberId, { $addToSet: { wishlistedBooks: book.id } });
        }

        return;
    })();
}