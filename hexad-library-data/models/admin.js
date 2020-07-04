const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const admin = new Schema({
    // Basic credentials, with a set role
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'ADMIN' },

    // Fields that will automatically update to track history
    created: { type: Date, required: true },
    authenticated: { type: Date },

    // Library-related fields
    addedBooks: [{ type: ObjectId, ref: 'Book' }],
    requests: {
        type: [{
            memberId: { type: ObjectId, ref: 'Member' },
            bookId: { type: String }
        }]
    },
    rentedBooks: {
        type: [{
            memberId: { type: ObjectId, ref: 'Member' },
            bookId: { type: ObjectId, ref: 'Book' },
            expiracyDate: { type: Date }
        }]
    }
});

module.exports = mongoose.model('Admin', admin);