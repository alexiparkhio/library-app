const { registerUser } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { body: { email, password, role } } = req;

    try {
        registerUser(email, password, role)
            .then(() => res.status(201).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}