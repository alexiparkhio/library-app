const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const book = new Schema({
    // Field that will automatically be added to track history
    added: { type: Date, required: true },

    // Basic information to display about the book. Should the application get more growth, one simply should add extra fields below
    idNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    author: { type: String },
    yearOfPublication: { type: Number },

    // Info about the stock and availability, in case new unities are added later on
    stock: { type: Number, required: true },
    status: { type: String, enum: ['available', 'unavailable'], default: 'available' }
});

module.exports = mongoose.model('Book', book);