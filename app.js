const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const path = require('path');
const morgan = require('morgan');

const Message = require('../diploma_mqtt/models/messageSchema');
const key = require('./config/key')

const Broker_URL = 'mqtt://192.168.1.31';
const options = {
    //clientId: 'clientId_example',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'oladik',
    password: 'topsecret',
    port: 1883,
    keepalive: 60
};

const app = express();
const port = 3000;
app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '/public')));
app.use(morgan('combined', ''));

mongoose.connect(key.mongoURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});
const connection = mongoose.connection;

connection.once('open', function () {
    console.log('Connected to MongoDB.');
    let client = mqtt.connect(Broker_URL, options);

    client.on('connect', function () {
        client.subscribe('#', function (err) {
            if (!err) {
                console.log('Connected to MQTT broker.');
                //client.publish('status/', 'Successfully connected.');
            } else {
                console.log('Error connecting to MQTT broker!');
            }
        });
    });

    client.on('reconnect', function () {
        console.log('Reconnecting...');
        client = mqtt.connect(Broker_URL, options);
    });

    client.on('error', function (err) {
        console.log(err);
    });

    client.on('message', function (topic, message, packet) {
        //console.log(packet);
        const msg = new Message({
            clientId: options.clientId,
            topic: packet.topic,
            message: message,
            dateTime: Date.now()
        });
        msg.save().then(() => {
            console.log('Message was saved to db.');
        }).catch(() => {
            console.log('There was an error when saving \n' + msg + ' \nto db.');
        });
    });
    client.on('packetreceive', function (packet) {
        //console.log(packet);
    });
    client.on('offline', function () {
        console.log('MQTT broker is currently offline.');
    });
});

app.get('/', async (req, res) => {
    const msg = await Message.find({}, null, {sort: {dateTime: -1}}, function (err, result) {
        if (!result) {
            console.log('No messages in db.');
        } else {
        }
    }).lean();
    res.render("home", {msg});
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
