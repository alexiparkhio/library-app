const { models: { Book } } = require('library-data');

/**
 * Retrieves all available books that are in the database. No authentication or login is needed in order to successfully retrieve them.
 * 
 * @returns {Promise<Object[]>} returns a Promise with an array of all available books
 * 
*/
module.exports = () => {
    return (async () => {
        const books = await Book.find().lean();

        if (books.length) {
            books.forEach(book => {
                book.id = book._id.toString();
                delete book._id, delete book.__v;
            });

            return books;
        } else return [];
    })();
}