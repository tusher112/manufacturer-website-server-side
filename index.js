const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jdfwn.mongodb.net/?retryWrites=true&w=majority`;

console.log("mongodb connected");

app.get('/', (req, res) => {
  res.send('hello from hexashop!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})