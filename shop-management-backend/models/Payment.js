const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const DailySummarySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    totalSale: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    totalUpi: { type: Number, required: true },
    totalDesiSale: { type: Number, required: true },
    totalBeerSale: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', PaymentSchema);
const DailySummary = mongoose.model('DailySummary', DailySummarySchema);

module.exports = { Payment, DailySummary };
