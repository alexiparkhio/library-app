const { utils: { validate }, errors: { NotAllowedError } } = require('hexad-library-commons');
const context = require('./context');
const fetch = require('./fetch');

module.exports = function (email, password, role) {
    validate.string(email, 'email');
    validate.string(password, 'password');
    validate.string(role, 'role');
        
    return (async() => await fetch.post(`${this.API_URL}/users`, { email, password, role }))();
}.bind(context)