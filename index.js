const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jdfwn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}


async function run(){
    try{
        await client.connect();
        console.log("database con")
        const productsCollection=client.db('hexa-shop').collection('products');
        
        
        app.get('/product', async (req, res) =>{
          const query={};
          const cursor=productsCollection.find(query);
          const products=await cursor.toArray();
          res.send(products);
        });


        app.get('/user', verifyJWT, async (req, res) => {
          const users = await userCollection.find().toArray();
          res.send(users);
          console.log("jwr")
        });


    }
    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('hello from hexashop!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})