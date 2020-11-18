const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const Broker_URL = 'mqtt://192.168.1.31';
const options = {
    //clientId: 'clientId_example',
    port: 1883,
    keepalive: 60
};

const Message = require('../diploma_mqtt/models/messageSchema');

const app = express();
const port = 3000;
app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

const mongoURI = 'mongodb+srv://n0sty:mqtt@cluster0.z8myq.mongodb.net/mqtt_test_db?retryWrites=true&w=majority';
mongoose.connect(mongoURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const connection = mongoose.connection;
connection.once('open', function () {
    console.log('Connected to db');
    let client = mqtt.connect(Broker_URL, options);

    client.on('connect', function () {
        client.subscribe('#', function (err) {
            if (!err) {
                console.log('Connected to MQTT broker.');
                client.publish('status/', 'Successfully connected.');
            } else {
                console.log('Error connecting to MQTT broker!');
            }
        })
    });

    client.on('reconnect', function () {
        client = mqtt.connect(Broker_URL, options);
    });

    client.on('error', function (err) {
        console.log(err);
    });

    client.on('message', function (topic, message, packet) {
        console.log(packet);
        const msg = new Message({
            messageId: 'messageId_example',
            clientId: options.clientId,
            topic: packet.topic,
            message: message
        });
        msg.save().then(() => {
            console.log('Message was saved to db.');
        }).catch(() => {
            console.log('There was an error when saving \n' + msg + ' \nto db.');
        });
    });
});

app.get('/', async (req, res) => {
    const msg = await Message.find({}).lean();
    res.render("home", {msg});

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
