const express = require('express');
const router = express.Router();
const Record = require('../models/Record');


router.post('/', async (req, res) => {
    const { recordName, shopName, message, amount, date,paymentMethod } = req.body;

    try {
        const newRecord = new Record({
            recordName,
            shopName,
            message,
            amount,
            date: new Date(date), // Ensure date is properly formatted
            paymentMethod
        });

        const record = await newRecord.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/records
// @desc    Get records with optional filtering and sorting
// @access  Private
router.get('/', async (req, res) => {
    const { date, sortOrder } = req.query;
    const sort = sortOrder === 'desc' ? -1 : 1;

    try {
        let query = {};
        if (date) {
            // Create date range for the entire day
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Record.find(query).sort({ amount: sort });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
