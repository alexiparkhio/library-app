const fetch = require('./fetch');
const context = require('./context');

/**
 * Retrieves all available books that are in the database. No authentication or login is needed in order to successfully retrieve them.
 * 
 * @returns {Promise<Object[]>} returns a Promise with an array of all available books
 * 
*/
module.exports = function () {
    return (async () => {
        
        return await fetch.get(`${this.API_URL}/books`)
    })()
}.bind(context)