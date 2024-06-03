const express = require('express');
const router = express.Router();
const BillHistory = require('../models/BillHistory');
const auth = require('../middleware/auth');  // Import authentication middleware
const logEvent = require('../middleware/LogEvent');

// Create a new bill history record
router.post('/', auth(['admin']), async (req, res) => {
  const { updatedStocks, pdfDate, totalSale, upiPayment, discount, breakageCash, canteenCash, totalDesiSale, totalBeerSale, salary, shop ,rent,rateDiff,totalPaymentReceived} = req.body;
  
  try {
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
      totalPaymentReceived, 
      salary,
      shop,
    });

    await newBillHistory.save();
    await logEvent(req.user.name, 'New bill history record added', 'billHistory', 'POST /api/billHistory', { updatedStocks, pdfDate, totalSales, upiPayment, discount, breakageCash, canteenCash, desiSales, beerSales, salary, shop });
    
    res.status(201).json(newBillHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error saving bill history', error });
  }
});

// Get bill history
router.get('/', auth(['admin', 'employee']), async (req, res) => {
  const { month } = req.query;

  try {
    let filter = {};
    if (month) {
      const date = new Date(month + '-01');
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      filter.pdfDate = { $gte: date, $lt: nextMonth };
    }

    const billHistories = await BillHistory.find(filter).sort({ pdfDate: -1 });
    res.status(200).json(billHistories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill history', error });
  }
});

module.exports = router;
