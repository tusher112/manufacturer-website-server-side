const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection=client.db('hexa-shop').collection('users');
        const reviewsCollection=client.db('hexa-shop').collection('reviews');
        const purchaseCollection=client.db('hexa-shop').collection('purchase');

        
        
        app.get('/product', async (req, res) =>{
          const query={};
          const cursor=productsCollection.find(query);
          const products=await cursor.toArray();
          res.send(products);
        });

        app.get("/product/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const product = await productsCollection.findOne(query);
          res.send(product);
        });

        //POST
        app.post("/product", async (req, res) => {
          const newProduct = req.body;
          const result = await productsCollection.insertOne(newProduct);
          res.send(result);
        });


        //Purchase
        app.get("/purchase", verifyJWT, async (req, res) => {
          const userEmail = req.query.userEmail;
          const decodedEmail = req.decoded.email;
          if (userEmail === decodedEmail) {
            const query = { userEmail: userEmail };
            const purchase = await purchaseCollection.find(query).toArray();
            return res.send(purchase);
          } else {
            return res.status(403).send({ message: "Forbidden access" });
          }
        });
    
    
        app.get('/purchase/:id', verifyJWT, async(req, res) =>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const purchase = await purchaseCollection.findOne(query);
          res.send(purchase);
        })
    
        app.delete("/purchase/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await purchaseCollection.deleteOne(query);
          res.send(result);
        });

        app.post("/purchase", async (req, res) => {
          const purchase= req.body;
          const result = await purchaseCollection.insertOne(purchase);
          res.send(result);
        });
        

        app.get('/review', async (req, res) =>{
          const query={};
          const cursor=reviewsCollection.find(query);
          const reviews=await cursor.toArray();
          res.send(reviews);
        });

        
        //USER
        app.get("/user", verifyJWT, async (req, res) => {
          const users = await userCollection.find().toArray();
          res.send(users);
        });
    
        app.get('/admin/:email', async(req, res) =>{
          const email = req.params.email;
          const user = await userCollection.findOne({email: email});
          const isAdmin = user.role === 'admin';
          res.send({admin: isAdmin})
        })
    
        //Admin Access
        app.put("/user/admin/:email", verifyJWT, async (req, res) => {
          const email = req.params.email;
          const requester = req.decoded.email;
          const requesterAccount = await userCollection.findOne({ email: requester });
          if (requesterAccount.role === "admin") {
            const filter = { email: email };
            const updateDoc = {
              $set: { role: "admin" },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
          }
          else{
            return res.status(403).send({ message: "Forbidden access" });
          }
        });
    
        //PUT
        app.put("/user/:email", async (req, res) => {
          const email = req.params.email;
          const user = req.body;
          const filter = { email: email };
          const options = { upsert: true };
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
          res.send({ result, token });
        });
        //POST
        app.post("/review", async (req, res) => {
          const newReview = req.body;
          const result = await reviewsCollection.insertOne(newReview);
          res.send(result);
        });


        
       //User
       app.get("/user", verifyJWT, async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      });
  
      // app.get('/admin/:email', async(req, res) =>{
      //   const email = req.params.email;
      //   const user = await userCollection.findOne({email: email});
      //   const isAdmin = user.role === 'admin';
      //   res.send({admin: isAdmin})
      // })
  
      // //Admin Access
      // app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      //   const email = req.params.email;
      //   const requester = req.decoded.email;
      //   const requesterAccount = await userCollection.findOne({ email: requester });
      //   if (requesterAccount.role === "admin") {
      //     const filter = { email: email };
      //     const updateDoc = {
      //       $set: { role: "admin" },
      //     };
      //     const result = await userCollection.updateOne(filter, updateDoc);
      //     res.send(result);
      //   }
      //   else{
      //     return res.status(403).send({ message: "Forbidden access" });
      //   }
      // });
  
      //PUT
      app.put("/user/:email", async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.send({ result, token });
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