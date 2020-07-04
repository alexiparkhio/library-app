const { retrieveBooks } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    try {
        retrieveBooks()
            .then(books => res.status(200).json(books))
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}