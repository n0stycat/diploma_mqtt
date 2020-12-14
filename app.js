const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
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


mongoose.connect(key.mongoURI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}).then(() => {
    console.log('Connected to MongoDB.');
});

app.get('/', async (req, res) => {
    let resultMap = {};
    await pubsub.find({}, null, {sort: {_id: -1}}, function (err, results) {
        if (!results) {
            console.log('No messages in db.');
        } else {
            results.forEach((result) => {
                resultMap[result._id] = result;
            })
        }
    }).lean();
    res.render("home", {resultMap});
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
