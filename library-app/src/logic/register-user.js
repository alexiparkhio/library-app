const { utils: { validate } } = require('library-commons');
const context = require('./context');
const fetch = require('./fetch');

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
module.exports = function (email, password, role) {
    validate.string(email, 'email');
    validate.email(email);
    validate.string(password, 'password');
    validate.string(role, 'role');
        
    return (async() => await fetch.post(`${this.API_URL}/users`, { email, password, role }))();
}.bind(context)