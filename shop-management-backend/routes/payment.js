const express = require('express');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const logEvent = require('../middleware/LogEvent');
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
        await logEvent(req.user.id, 'Payment created', 'payment', 'POST /api/payments', {
            paymentId: payment._id,
            amount,
            method
        });
        res.json(payment);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all payments
router.get('/', auth(['admin', 'employee']), async (req, res) => {
    try {
        const payments = await Payment.find().populate('user', ['name', 'email']).sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
