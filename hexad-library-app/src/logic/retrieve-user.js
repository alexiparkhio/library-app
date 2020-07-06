const fetch = require('./fetch');
const context = require('./context');
const { utils: { validate } } = require('hexad-library-commons');

/**
 * Retrieves a (sanitized) member or an admin, depending on the role provided.
 * 
 * @param {string} role user's role (ADMIN or MEMBER)
 * 
 * @returns {Promise<Object>} returns a Promise with the admin/member
 * 
 * @throws {NotFoundError} if the admin/member does not exist
 * 
*/
module.exports = function (role) {
    validate.string(role, 'role')

    return (async () => {
        const token = this.storage.token;
        debugger
        return await fetch.get(`${this.API_URL}/users/${role}`, token)
    })()
}.bind(context)