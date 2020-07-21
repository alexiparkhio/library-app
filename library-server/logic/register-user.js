const { errors: { NotAllowedError }, utils: { validate } } = require('library-commons');
const { models: { Admin, Member } } = require('library-data');
const bcrypt = require('bcryptjs');

/**
 * Registers a new Admin or Member (depending on the role provided) to the database
 * 
 * @param {string} email User's unique email address
 * @param {string} password User's unique password
 * @param {string} role ADMIN or MEMBER
 * 
 * @returns {Promise<void>} An empty Promise on a successful registration
 * 
 * @throws {NotAllowedError} if a user with the same email is already on the database
 * 
*/
module.exports = (email, password, role) => {
    validate.string(email, 'email');
    validate.email(email);
    validate.string(password, 'password');
    validate.string(role, 'role');

    return (async () => {
        if (role === 'ADMIN') {
            // Evaluation to see if the admin already exists
            const admin = await Admin.findOne({ email });
            if (admin) throw new NotAllowedError(`an admin with email ${email} already exists`); 

            // Password encryptation with bcryptjs
            const encryptedPassword = await bcrypt.hash(password, 10);

            await Admin.create({ email, password: encryptedPassword, role, created: new Date() });

            return;
        } else if (role === 'MEMBER') {
            // Evaluation to see if the member already exists
            const member = await Member.findOne({ email });
            if (member) throw new NotAllowedError(`a member with email ${email} already exists`); 

            // Password encryptation with bcryptjs
            const encryptedPassword = await bcrypt.hash(password, 10);

            await Member.create({ email, password: encryptedPassword, role, created: new Date() });

            return;
        }
    })();
}