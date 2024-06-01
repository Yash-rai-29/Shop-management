const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

// @route   POST api/records
// @desc    Add a new record
// @access  Private
router.post('/', async (req, res) => {
    const { recordName, shopName, message, amount, month } = req.body;

    try {
        const newRecord = new Record({
            recordName,
            shopName,
            message,
            amount,
            month
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
    const { month, sortOrder } = req.query;
    const sort = sortOrder === 'desc' ? -1 : 1;

    try {
        let query = {};
        if (month) {
            query.month = month;
        }

        const records = await Record.find(query).sort({ amount: sort });
        res.json(records);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
