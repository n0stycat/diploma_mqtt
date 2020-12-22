const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pubsubSchema = Schema({
    cmd: {type: String, required: true},
    brokerId: {type: String, required: true},
    brokerCounter: {type: Number, required: true},
    topic: {type: String, required: true},
    payload: {type: Buffer, required: true},
    qos: {type: Number, required: true},
    retain: {type: Boolean, required: true},
    dup: {type: Boolean, required: true},
    dateTime: {type: Date, default: Date.now(), required: true}
});

module.exports = mongoose.model('pubsub', pubsubSchema, 'pubsub');
