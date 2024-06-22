const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/records', require('./routes/records'));
app.use('/api/eventRecords', require('./routes/eventRecords'));
app.use('/api/billHistory', require('./routes/billHistory'));
app.get('/', (req, res) => {
    res.send('Hello from Vercel!');
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
