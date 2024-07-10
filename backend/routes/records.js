const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

router.post('/', async (req, res) => {
    const { recordName, shopName, message, amount, date,paymentMethod,accountType } = req.body;
    console.log('Incoming request body:', req.body); // Add this line


    try {
        const amountNumber = parseFloat(amount);

        // Validate required fields
        if (!recordName || !shopName || !message || isNaN(amountNumber) || !date || !paymentMethod) {
            return ('Please enter all fields');
        }

        // Validate date format
        const formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ msg: 'Invalid date format' });
        }
        const newRecord = new Record({
            recordName,
            shopName,
            message,
            amount,
            date: formattedDate,
            paymentMethod,
            accountType
        });

        const record = await newRecord.save();
        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', async (req, res) => {
    const { date, sortOrder } = req.query;
    const sort = sortOrder === 'desc' ? -1 : 1;

    try {
        let query = {};
        if (date) {
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
