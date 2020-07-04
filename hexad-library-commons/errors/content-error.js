/**
 * This error will be displayed when the typology of values is not the one expected. It works as a TypeError but for more specified value structures. It is meant to be used especially for validator tools.
 */
module.exports = class ContentError extends Error {
    constructor(...args) {
        super(...args)

        this.name = ContentError.name
    }
}