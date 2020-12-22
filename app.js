const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');

const pubsub = require('../diploma_mqtt/models/pubsubSchema');
const key = require('./config/key')

const app = express();
const port = 443;


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
});

app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});
