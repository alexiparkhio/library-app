/**
 * This error is displayed when there has been some incompatibilities with credentials or values that prevent a step forward (e.g. a length limitation). It will trigger an status of 409.
 */
module.exports = class NotAllowedError extends Error {
    constructor(...args) {
        super(...args)

        this.name = NotAllowedError.name
    }
}