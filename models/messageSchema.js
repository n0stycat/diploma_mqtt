const mongoose = require('mongoose');
const Schema = mongoose.Schema

const messageSchema = Schema({
    topic: {type: String, required: true},
    message: {type: String, required: true},
    clientId: {type: String, required: true},
    messageId: {type: String, required: true},
    dateTime: {type: Date, default: Date.now(), required: true}
});

module.exports = mongoose.model('Message', messageSchema);
