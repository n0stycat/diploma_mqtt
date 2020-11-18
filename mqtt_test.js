mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to database.');

    })
    .catch(() => {
        console.log('Connection failed!')
    });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

