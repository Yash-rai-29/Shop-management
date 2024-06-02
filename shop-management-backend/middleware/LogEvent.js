const EventRecord = require('../models/EventRecord');

const logEvent = async (user, detail, eventCategory, route, additionalInfo = {}) => {
    const eventRecord = new EventRecord({
        user,
        detail,
        eventCategory,
        route,
        additionalInfo: JSON.stringify(additionalInfo)
    });

    await eventRecord.save();
};

module.exports = logEvent;
