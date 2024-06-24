const EventRecord = require('../models/EventRecord');

const logEvent = async (user, detail, eventCategory, route, additionalInfo = {}) => {
    const eventRecord = new EventRecord({
        user,
        detail,
        eventCategory,
        route,
        additionalInfo: JSON.stringify(additionalInfo)
    });

    try {
        await eventRecord.save();
    } catch (err) {
        console.error('Error saving event log:', err);
    }
};

module.exports = logEvent;
