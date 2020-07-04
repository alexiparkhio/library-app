const {
    utils: { validate },
    errors: { NotFoundError, NotAllowedError }
} = require('hexad-library-commons');
const { models: { Admin, Member } } = require('hexad-library-data');
const bcrypt = require('bcryptjs');

/***
 * Authenticates either the Admin or the Member con correct or wrong credentials
 * 
 * @param {string} email user's unique email
 * @param {string} password user's password
 * @param {string} role user's role (ADMIN or MEMBER)
 * 
 * @returns {Promise<string>} returns a Promise with the user's id
 * 
 * @throws {NotFoundError} if the admin or the member, depending on the role provided, do not exist
 * @throws {NotAllowedError} if the credentials provided do not match
 * 
 */
module.exports = (email, password, role) => {
    validate.string(email, 'email');
    validate.email(email);
    validate.string(password, 'password');
    validate.string(role, 'role');

    return (async () => {
        if (role === 'ADMIN') {
            const admin = await Admin.findOne({ email });
            if (!admin) throw new NotFoundError(`admin with email ${email} does not exist`);

            const match = await bcrypt.compare(password, admin.password);
            if (!match) throw new NotAllowedError('wrong credentials');

            await Admin.findOneAndUpdate({ email }, { $set: { authenticated: new Date() } });
            
            return admin.id.toString();
            
        } else if (role === 'MEMBER') {
            const member = await Member.findOne({ email });
            if (!member) throw new NotFoundError(`member with email ${email} does not exist`);
            
            const match = await bcrypt.compare(password, member.password);
            if (!match) throw new NotAllowedError('wrong credentials');
            
            await Member.findOneAndUpdate({ email }, { $set: { authenticated: new Date() } });

            return member.id.toString();
        }
    })();
}
