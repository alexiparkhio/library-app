const { updateBook } = require('../../logic');
const { errorHandler } = require('../../helpers');

module.exports = (req, res) => {
    const { body: bookData, payload: { sub: id }, params: {idNumber} } = req
    bookData.idNumber = parseInt(idNumber);

    try {
        updateBook(id, bookData)
            .then(() => res.status(206).end())
            .catch(error => errorHandler(error, res));
    } catch (error) {
        errorHandler(error, res);
    }
}