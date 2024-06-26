const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    recordName: {
        type: String,
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    paymentMethod: { type: String, required: true }
});

module.exports = mongoose.model('Record', RecordSchema);