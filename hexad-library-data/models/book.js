const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const book = new Schema({
    // Field that will automatically be added to track history
    added: { type: Date, required: true },

    // Basic information to display about the book. Should the application get more growth, one simply should add extra fields below
    title: { type: String, required: true },
    description: { type: String },
    author: { type: String },
    yearOfPublication: { type: Number }
});

module.exports = mongoose.model('Book', book);