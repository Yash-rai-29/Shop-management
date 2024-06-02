const express = require('express');
const auth = require('../middleware/auth');
const EventRecord = require('../models/EventRecord');
const router = express.Router();

// Get all event records
router.get('/', auth(['admin']), async (req, res) => {
    try {
        const eventRecords = await EventRecord.find().populate('user', ['name', 'email']);
        res.json(eventRecords);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
