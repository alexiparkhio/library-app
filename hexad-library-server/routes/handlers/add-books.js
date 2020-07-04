const { addBooks } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { body: bookData, payload: { sub: adminId } } = req;
    const { stock } = bookData;

    try {
        addBooks(adminId, body, stock)
            .then(() => res.status(201).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}