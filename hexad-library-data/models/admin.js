const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const admin = new Schema({
    // Basic credentials, with a set role
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: 'ADMIN',

    // Fields that will automatically update to track history
    created: { type: Date, required: true },
    authenticated: { type: Date },

    // Library-related fields
    addedBooks: [
        {
            type: {
                bookId: { type: ObjectId, ref: 'Book' },
                stock: { type: Number }
            }
        }
    ],
    requests: [
        {
            type: {
                memberId: { type: ObjectId, ref: 'Member' },
                bookId: { type: ObjectId, ref: 'Book' }
            }
        }
    ],
    rentedBooks: [
        {
            type: {
                memberId: { type: ObjectId, ref: 'Member' },
                bookId: { type: ObjectId, ref: 'Book' },
                expiracyDate: { type: Date }
            }
        }
    ]
});

module.exports = mongoose.model('Admin', admin);