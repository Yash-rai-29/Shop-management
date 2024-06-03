const mongoose = require('mongoose');

const BillHistorySchema = new mongoose.Schema({
  updatedStocks: [
    {
      product: String,
      size: Number,
      lastQuantity: Number,
      quantity: Number,
      price: Number,
      totalSale: Number,
    }
  ],
  pdfDate: { type: Date, required: true },
  totalSales: Number,
  upiPayment: Number,
  discount: Number,
  breakageCash: Number,
  canteenCash: Number,
  desiSales: Number,
  beerSales: Number,
  salary: Number,
  shop: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BillHistory', BillHistorySchema);
