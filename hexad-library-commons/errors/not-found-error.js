/**
 * This error is displayed when a value, variable or a similar was meant to be found among the file or the dependencies. It will trigger an status of 404.
 */
module.exports = class NotFoundError extends Error {
    constructor(...args) {
        super(...args)

        this.name = NotFoundError.name
    }
}