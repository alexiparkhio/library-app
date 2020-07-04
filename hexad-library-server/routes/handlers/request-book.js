const { requestBook } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { body: { ISBN }, payload: { sub: id } } = req

    try {
        requestBook(id, ISBN)
            .then(() => res.status(201).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}