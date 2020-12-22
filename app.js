const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path');

const pubsub = require('../diploma_mqtt/models/pubsubSchema');
const key = require('./config/key')

const app = express();
const port = 3000;


let hbs = exphbs.create({
    helpers: {
        splitString: function (something) {
            let t = something.buffer.toString().split("|");
            if (t.length === 15) {
                return 'Date: ' + t[0] + 'status: ' + t[1];
            } else {
                return something
            }
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect(key.mongoURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(() => {
    console.log('Connected to MongoDB.');
});

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        if (username === 'test' && password === 'testtest') {
            request.session.loggedin = true;
            request.session.username = username;
            response.redirect('/data');
        } else {
            response.send('Incorrect Username and/or Password!');
        }
        response.end();
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});

app.get('/data', async (req, res) => {
    if (req.session.loggedin) {
        let resultMap = {};
        await pubsub.find({}, null, {sort: {_id: -1}}, function (err, results) {
            if (!results) {
                console.log('No messages in db.');
            } else {
                results.forEach((result) => {
                    resultMap[result._id] = result;
                    if (resultMap[result._id].payload.toString().split('|').length === 15) {
                        resultMap[result._id]['chas'] = resultMap[result._id].payload.buffer.toString().split('|')[0];
                        resultMap[result._id]['stan_roboti'] = resultMap[result._id].payload.buffer.toString().split('|')[1];
                        resultMap[result._id]['rejim_roboti'] = resultMap[result._id].payload.buffer.toString().split('|')[2];
                        resultMap[result._id]['zah_potencial'] = resultMap[result._id].payload.buffer.toString().split('|')[3];
                        resultMap[result._id]['napruga'] = resultMap[result._id].payload.buffer.toString().split('|')[4];
                        resultMap[result._id]['strum'] = resultMap[result._id].payload.buffer.toString().split('|')[5];
                        resultMap[result._id]['stan_dverei'] = resultMap[result._id].payload.buffer.toString().split('|')[6];
                        resultMap[result._id]['temperatura'] = resultMap[result._id].payload.buffer.toString().split('|')[7];
                        resultMap[result._id]['stan_mereji'] = resultMap[result._id].payload.buffer.toString().split('|')[8];
                        resultMap[result._id]['lichilnik'] = resultMap[result._id].payload.buffer.toString().split('|')[9];
                        resultMap[result._id]['yakist_signalu'] = resultMap[result._id].payload.buffer.toString().split('|')[10];
                        resultMap[result._id]['stan_akkumulyatora'] = resultMap[result._id].payload.buffer.toString().split('|')[11];
                        resultMap[result._id]['chas_napracyuvannya'] = resultMap[result._id].payload.buffer.toString().split('|')[12];
                        resultMap[result._id]['periodichnist'] = resultMap[result._id].payload.buffer.toString().split('|')[13];
                        resultMap[result._id]['avariya'] = resultMap[result._id].payload.buffer.toString().split('|')[14];
                    }
                })
            }
        }).lean();
        res.render("home", {resultMap});
    } else {
        res.send('Please login to view this page!');
    }
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});
