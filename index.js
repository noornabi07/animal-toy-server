const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middlware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_TOYS}:${process.env.DB_PASS}@cluster0.cnuoch3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toysDB').collection('addToys');

    app.post('/addToys', async(req, res) =>{
        const toys = req.body;
        const result = await toyCollection.insertOne(toys);
        res.send(result)
    })

    app.get('/allToys/:text', async(req, res) =>{
        if(req.params.text == "teddy bear" || req.params.text === "hors" || req.params.text=="cat"){
            const result = await toyCollection.find({subCategory: req.params.text}).toArray();
            return res.send(result)
        }
        const result = await toyCollection.find().toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Animal Toys Shopping coming...')
})

app.listen(port, () =>{
    console.log(`Animal toys shop run port is: ${port}`)
})