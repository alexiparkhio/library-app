const { models: { Admin, Member } } = require('library-data');
const { errors: { NotFoundError }, utils: { validate } } = require('library-commons');

/**
 * Retrieves a (sanitized) member or an admin, depending on the role provided.
 * 
 * @param {string} id user's unique ID
 * @param {string} role user's role (ADMIN or MEMBER)
 * 
 * @returns {Promise<Object>} returns a Promise with the admin/member
 * 
 * @throws {NotFoundError} if the admin/member does not exist
 * 
*/
module.exports = (id, role) => {
    validate.string(id, 'id');
    validate.string(role, 'role');

    return (async () => {
        if (role === 'ADMIN') {
            const admin = await Admin.findById(id)
                .lean()
                .populate('rentedBooks.user', 'email')
                .populate('requests.requester', 'email')
                .populate('rentedBooks.book', 'ISBN title description author stock yearOfPublication');

            if (!admin) throw new NotFoundError(`admin with id ${id} does not exist`);

            admin.id = admin._id.toString();
            delete admin._id, delete admin.__v, delete admin.password;

            admin.requests.forEach(request => delete request._id);

            return admin;
        } else if (role === 'MEMBER') {
            const member = await Member.findById(id)
                .lean()
                .populate('requestedBooks', 'ISBN')
                .populate('wishlistedBooks', 'ISBN title description author stock yearOfPublication')
                .populate('borrowedBooks.bookId', 'ISBN title description author stock yearOfPublication');

            if (!member) throw new NotFoundError(`member with id ${id} does not exist`);

            member.id = member._id.toString();
            delete member._id, delete member.__v, delete member.password;

            member.requestedBooks.forEach(request => delete request._id);

            return member;
        }
    })();
}