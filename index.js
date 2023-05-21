const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();

    const toyCollection = client.db('toysDB').collection('addToys');

    // const sort = { length: -1 }
    const limit = 20;

    const indexKeys = { toyName: 1, subCategory: 1 }
    const indexOptions = { name: 'toyNameCategory' }

    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    // find search by text
    app.get('/searchByToyName/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { toyName: searchText},
          { subCategory:searchText}
        ],
      }).toArray();
      res.send(result)
    })


    // data added route
    app.post('/addToys', async (req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      res.send(result)
    })

    // all data get for read in ui
    app.get('/allToys', async (req, res) => {
      const result = await toyCollection.find().limit(limit).toArray();
      res.send(result);
    })

      // get the data by category route
    app.get('/categoryToys/:text', async (req, res) => {
      if (req.params.text == "teddy" || req.params.text == "cat" || req.params.text == "hors") {
        const result = await toyCollection.find({ subCategory: req.params.text }).toArray();
        return res.send(result)
      }
      
        const result = await toyCollection.find({}).toArray();
        res.send(result);
      
    })

    // get the data specific by id
    app.get('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result)
    })

    // update date make route by id
  app.put('/allToys/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const options = {upsert: true};
    const updateToys = req.body;
    const toys = {
      $set: {
        price: updateToys.price,
        quantity: updateToys.quantity,
        message: updateToys.message
      }
    };

    const result = await toyCollection.updateOne(filter, toys, options)
    res.send(result)
  })

  // deleted route by id
    app.delete('/allToys/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // find data by email running
    app.get('/myToys/:email', async (req, res) => {
      const result = await toyCollection.find({ email: req.params.email }).sort(sort).toArray();
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


app.get('/', (req, res) => {
  res.send('Animal Toys Shopping coming...')
})

app.listen(port, () => {
  console.log(`Animal toys shop run port is: ${port}`)
})