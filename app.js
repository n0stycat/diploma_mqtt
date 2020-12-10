const mqemitter = require('mqemitter-mongodb');
const aedesPersistenceMongoDB = require('aedes-persistence-mongodb');
const fs = require('fs');

//const port = 8883; // TLS
const port = 1883; // TCP
const MONGO_URL = 'mongodb+srv://n0sty:mqtt@cluster0.z8myq.mongodb.net/test_db';
const optionsBroker = {
    id: 'Aedes',
    mq: mqemitter({
        url: MONGO_URL
    }),
    persistence: aedesPersistenceMongoDB({
        url: MONGO_URL,
    })
};
const optionsServer = {
    ca: fs.readFileSync('ca.crt'),
    cert: fs.readFileSync('server.crt'),
    key: fs.readFileSync('server.key'),
    requestCert: true,
}

function startAedes() {
    const aedes = require('aedes')(optionsBroker);

    // aedes.authorizeSubscribe = function(client, sub, callback) {
    //          let err = null;
    //          if (sub.topic === 'forbidden_sub') {
    //              sub = null;
    //              err = Error('Not authorized');
    //          }
    //          callback(err, sub);
    //      }
    aedes.authorizeSubscribe = function (client, sub, callback) {
        if (sub.topic === 'forbidden_sub') {
            return callback(new Error('wrong topic'));
        }
        callback(null, sub);
    };

    aedes.authorizePublish = function (client, packet, callback) {
        if (packet.topic === 'forbidden_pub') {
            return callback(new Error('wrong topic'));
        }
        if (packet.topic === 'forbidden_pub2') {
            packet.payload = Buffer.from('overwrite packet payload');
        }
        callback(null);
    };

    //   aedes.authenticate = function (client, username, password, callback) {
    //     callback(null, (username === 'oladik'));
    // }
    //const server = require('tls').createServer(optionsServer, aedes.handle); // TLS
    const server = require('net').createServer(aedes.handle); // TCP

    server.listen(port, function () {
        console.log('Aedes listening on port:', port);
        //aedes.publish({topic: 'aedes/hello', payload: "I'm broker " + aedes.id});
    });

    aedes.on('subscribe', function (subscriptions, client) {
        console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id);
    });

    aedes.on('unsubscribe', function (subscriptions, client) {
        console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id);
    });

    aedes.on('client', function (client) {
        console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    });

    aedes.on('clientError', function (err) {
        console.log('error');
        console.log(err);
    });

    aedes.on('clientDisconnect', function (client) {
        console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
    });

    aedes.on('publish', async function (packet, client) {
        console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic);
        // let clientName;
        // client ? clientName = client.id.slice(0, 36) : clientName = client;
        // aedes.mq.emit(packet);
        // console.log(packet);
    });
}

startAedes();
