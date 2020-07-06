const { addBooks } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { body: bookData, payload: { sub: adminId } } = req;
    const { stock } = bookData;
    delete bookData.stock;

    try {
        addBooks(adminId, bookData, stock)
            .then(() => res.status(201).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}