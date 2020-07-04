const { removeBook } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { payload: { sub: id }, params: { ISBN } } = req

    try {
        remove(id, ISBN)
            .then(() => res.status(206).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}