require('dotenv').config();
const express = require('express');
const morgen = require('morgan');
const cors = require('cors');
const authRoute = require('./routes/auth.route');
require('./config/db')();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: process.env.CLIENT_URL
    }));

    app.use(morgen('dev'));
}

app.use('/api', authRoute);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Page not found',
    })
});


app.listen(PORT, function () {
    console.log('server listening on port ' + PORT);
})