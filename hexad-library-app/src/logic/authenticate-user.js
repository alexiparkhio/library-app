const {
    utils: { validate },
    errors: { NotAllowedError, NotFoundError } 
} = require('hexad-library-commons');
const context = require('./context');
const fetch = require('node-fetch');

/***
 * Authenticates either the Admin or the Member con correct or wrong credentials
 * 
 * @param {string} email user's unique email
 * @param {string} password user's password
 * @param {string} role user's role (ADMIN or MEMBER)
 * 
 * @returns {Promise<void>} returns am empty Promise on a successful token generation
 * 
 * @throws {NotFoundError} if the admin or the member, depending on the role provided, do not exist
 * @throws {NotAllowedError} if the credentials provided do not match
 * 
 */
module.exports = function (email, password, role) {
    validate.string(email, 'email');
    validate.email(email);
    validate.string(password, 'password');
    validate.string(role, 'role');

    // This is the only function that will not use my custom fetch since I need to setup the token on the context's session storage
    return (async () => {
        const options = {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
            headers: { 'Content-type': 'application/json' }
        };

        const response = await fetch(`${this.API_URL}/users/auth`, options);

        const { status } = response;

        if (status === 200) {
            const { token } = await response.json();

            this.storage.token = token;

            return
        }

        if (status >= 400 && status < 500) {
            const { error } = await response.json();

            if (status === 401) {
                throw new NotAllowedError(error);
            }

            if (status === 404) {
                throw new NotFoundError(error);
            }

            throw new Error(error);
        }

        throw new Error('server error');
    })();
}.bind(context);