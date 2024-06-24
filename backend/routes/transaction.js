const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BillHistory = require('../models/BillHistory');
const Stock = require('../models/Stock');
const auth = require('../middleware/auth');
const logEvent = require('../middleware/LogEvent');

// Update stocks and create a bill history record transactionally
router.put('/updateStocksAndBill', auth(['admin']), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { updatedStocks, pdfDate, totalSale, upiPayment, discount, breakageCash, canteenCash, totalDesiSale, totalBeerSale, salary, shop, rent, rateDiff, totalPaymentReceived, transportation } = req.body;

        // 1. Update Stocks
        const stockUpdatePromises = updatedStocks.map(async (stock) => {
            const stockItem = await Stock.findById(stock._id).session(session);
            if (!stockItem) throw new Error(`Stock not found: ${stock._id}`);
            const previousQuantity = stockItem.quantity;
            stockItem.quantity = stock.newQuantity;

            await logEvent(req.user.name, 'Stock updated', 'stock', `PUT /api/stocks/${stock._id}`, {
                product: stockItem.product,
                size: stockItem.size,
                previousQuantity,
                updatedQuantity: stock.newQuantity,
                price: stockItem.price,
                totalSale: (previousQuantity - stock.newQuantity) * stockItem.price
            }, session);

            return stockItem.save({ session });
        });

        await Promise.all(stockUpdatePromises);

        // 2. Create Bill History
        const newBillHistory = new BillHistory({
            updatedStocks,
            pdfDate,
            totalSale,
            upiPayment,
            discount,
            breakageCash,
            canteenCash,
            totalDesiSale,
            totalBeerSale,
            rent,
            rateDiff,
            transportation,
            totalPaymentReceived,
            salary,
            shop,
        });

        await newBillHistory.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newBillHistory);
    } catch (error) {
        // Abort the transaction in case of error
        await session.abortTransaction();
        session.endSession();

        console.error('Error during transaction:', error);
        res.status(500).json({ message: 'Transaction failed', error });
    }
});

module.exports = router;
