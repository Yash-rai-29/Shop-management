const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    data: Buffer,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
