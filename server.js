const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

// Connect DB
connectDB();

// Init middleware
app.use(express.json({ extended: false}));

app.get('/', (req, res) => res.send('Server Up'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/expense', require('./routes/api/expense'));
app.use('/api/income', require('./routes/api/income'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Running on ${PORT}`));
