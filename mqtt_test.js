const mqtt = require('mqtt');
const Broker_URL = 'mqtt://192.168.1.31';
const options = {
    clientId: 'clientId_example',
    port: 1883,
    keepalive: 60
};
const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const mongoURI = 'mongodb+srv://n0sty:mqtt@cluster0.z8myq.mongodb.net/mqtt_test_db?retryWrites=true&w=majority';
const Message = require('../diploma_mqtt/models/messageSchema');

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to database.');
    })
    .catch(() => {
        console.log('Connection failed!')
    });

const client = mqtt.connect(Broker_URL, options);
const Topic = '#';

client.on('connect', function () {
    client.subscribe(Topic, function (err) {
        if (!err) {
            //client.publish('connection_status', 'Successfully connected.')
        }
    })
})

client.on('message', function (topic, message, packet) {
    const msg = new Message({
        messageId: 'messageId_example',
        clientId: options.clientId,
        topic: packet.topic,
        message: packet.payload
    });
    msg.save().then(() => {
        console.log('Message was saved to db.');
    }).catch(() => {
        console.log('There was an error when saving \n' + msg + ' \nto db.');
    });
})
