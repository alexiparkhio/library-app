const { Schema, Types: { ObjectId } } = require('mongoose');

module.exports = new Schema({
    requester: { type: ObjectId, ref: 'Member' },
    ISBN: { type: String, required: true }
})