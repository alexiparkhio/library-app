const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

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
    requestedBooks: [{ type: ObjectId, ref: 'Book' }],
    borrowedBooks: {
        type: [{
            bookId: { type: ObjectId, ref: 'Book' },
            expiracyDate: { type: Date }
        }]
    }
});

module.exports = mongoose.model('Member', member);