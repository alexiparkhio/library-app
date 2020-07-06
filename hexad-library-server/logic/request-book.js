const { models: { Member, Admin } } = require('hexad-library-data');
const {
    errors: { NotFoundError, NotAllowedError },
    utils: { validate }
} = require('hexad-library-commons');

/**
 * Creates a new book request, with a member ID and an specified ISBN to be requested to the admin users
 * 
 * @param {string} memberId member's unique ID
 * @param {string} ISBN the book's ISBN
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful request
 * 
 * @throws {NotFoundError} if the member does not exist
 * 
*/
module.exports = (memberId, ISBN) => {
    validate.string(memberId, 'memberId');
    validate.string(ISBN, 'ISBN');

    return (async () => {
        const member = await Member.findById(memberId);
        if (!member) throw new NotFoundError(`member with id ${memberId} does not exist`);

        if (typeof member.requestedBooks.find(book => book.ISBN === ISBN) !== 'undefined') throw new NotAllowedError(`book with ISBN ${ISBN} was already requested by member with id ${memberId}`);

        const request = { requester: memberId, ISBN };

        await Member.findByIdAndUpdate(memberId, { $addToSet: { requestedBooks: request } });

        const admins = await Admin.find();

        // Using a conventional for syntax in order to keep the same async/await scope
        for (let i = 0; i < admins.length; i++) {
            await Admin.findByIdAndUpdate(admins[i].id, { $addToSet: { requests: request } });
        };

        return;
    })();
}