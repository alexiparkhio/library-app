const fetch = require('./fetch');
const context = require('./context');
const { utils: { validate } } = require('hexad-library-commons');

/**
 * Retrieves a (sanitized) member or an admin, depending on the role provided.
 * 
 * @returns {Promise<Object>} returns a Promise with the admin/member
 * 
 * @throws {NotFoundError} if the admin/member does not exist
 * 
*/
module.exports = function () {
    return (async () => {
        const { token, role } = this.storage;
        
        return await fetch.get(`${this.API_URL}/users/${role}`, token)
    })()
}.bind(context)