const { errors: { NotAllowedError, NotFoundError, ContentError } } = require('library-commons');
const { JsonWebTokenError } = require('jsonwebtoken')

/**
 * Summarizes the typology of potential errors that the server should return and their proper statuses.
 * 
 * @param {number} error 
 * @param {*} res 
 * 
 * @returns {Promise<string>} returns a Promise with the specified error on a JSON body
 */
module.exports = function (error, res) {
    let status = 500;

    switch (true) {
        case error instanceof TypeError:
            status = 406;
            break;
        case error instanceof NotFoundError:
            status = 404;
            break;
        case error instanceof NotAllowedError || error instanceof JsonWebTokenError:
            status = 401;
            break;
    }

    res.status(status).json({ error: error.message });
}