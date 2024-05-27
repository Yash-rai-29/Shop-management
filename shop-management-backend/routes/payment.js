const express = require('express');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const router = express.Router();

// Create a new payment
router.post('/', auth(['admin', 'employee']), async (req, res) => {
    const { amount, method } = req.body;
    try {
        const payment = new Payment({
            user: req.user.id,
            amount,
            method
        });
        await payment.save();
        res.json(payment);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all payments
router.get('/', auth(['admin']), async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', ['name', 'email']);
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
