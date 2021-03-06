const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;
const request = require('./request');

const member = new Schema({
    // Basic credentials, with a set role
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'MEMBER' },

    // Fields that will automatically update to track history
    created: { type: Date, required: true },
    authenticated: { type: Date },

    // Library-related fields

    // Max: 2 books to borrow
    borrowLimit: { type: Number, default: 2 },
    requestedBooks: [request],
    borrowedBooks: {
        type: [{
            bookId: { type: ObjectId, ref: 'Book' },
            expiracyDate: { type: Date },
            daysCount: { type: Number },
        }]
    },
    overdueDays: { type: Number, default: 0 },

    wishlistedBooks: [{ type: ObjectId, ref: 'Book' }],
});

module.exports = mongoose.model('Member', member);