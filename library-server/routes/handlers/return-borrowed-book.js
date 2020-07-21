const { returnBorrowedBook } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { params: { ISBN }, payload: { sub: id } } = req

    try {
        returnBorrowedBook(id, ISBN)
            .then(() => res.status(206).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}