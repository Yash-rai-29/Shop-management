const mongoose = require('mongoose');

const EventRecordSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    detail: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    eventCategory: { type: String, required: true },
    route: { type: String, required: true },
    additionalInfo: { type: String, default: '{}' }  // Store additional information as a JSON string
});

module.exports = mongoose.model('EventRecord', EventRecordSchema);
