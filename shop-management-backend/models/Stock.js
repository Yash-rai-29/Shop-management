const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    product: { type: String, required: true },
    size: { type: String, required: true }, // Add this line
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now },
    shop: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Stock', StockSchema);
