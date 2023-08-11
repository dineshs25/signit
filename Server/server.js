const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const forms = require('./routes/forms');
const admin = require('./routes/admin');
require('dotenv').config();

const app = require('express')();

const allowedOrigins = ['http://localhost:3000','https://digitalmarketingcompanybangalore.in','https://signet.edu.au'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin is in the allowedOrigins array
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

mongoose
  .connect(process.env.MONGODB_API)
  .then(() => {
    console.log('DB_Connected');
  })
  .catch(() => {
    console.log('DB Connection failed');
  });

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/forms', forms);
app.use('/admin', admin);

app.listen(8000, () => {
  console.log('Server started');
});
