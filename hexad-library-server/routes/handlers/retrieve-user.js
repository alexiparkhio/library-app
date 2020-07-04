const { retrieveUser } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { params: { role }, payload: { sub: id } } = req

    try {
        retrieveUser(id, role)
            .then(user => res.status(200).json(user))
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}