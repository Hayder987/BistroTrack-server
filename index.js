require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7ya1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const menuCollection = client.db("bistroDb").collection("menuCollection");
    const reviewCollection = client.db("bistroDb").collection("reviewCollection");
    const userCollection = client.db("bistroDb").collection("userCollection");
    const cartCollection = client.db("bistroDb").collection("cartCollection");
    
    app.get('/menuItem', async(req, res)=>{
        const result = await menuCollection.find().toArray()
        res.send(result)
    })

    app.get('/reviewItem', async(req, res)=>{
        const result = await reviewCollection.find().toArray()
        res.send(result)
    })

    app.get('/categoryData/:category', async(req, res)=>{
         const category = req.params.category
         const query = {category: category}
         const page = parseInt(req.query.page) 
         const limit = parseInt(req.query.limit)
         const result = await menuCollection.find(query).skip(page*limit).limit(limit).toArray()

         const totalItems = await menuCollection.countDocuments(query);

         res.send({
            data: result,
            totalItems:totalItems
         })
    })

    app.post('/users', async(req, res)=>{
      const users = req.body
      const email = req.body.email
      const query = {email}
      const isExist = await userCollection.findOne(query)
      if(isExist){
        return res.send(isExist)
      }
      const result = await userCollection.insertOne({
        ...users,
        loginDate: Date.now(),
        type:"client"
      })
      res.send(result)
    })

    app.post('/cart', async(req, res)=>{
      const cart = req.body
      const email = cart.email
      const productId = cart.productId
      const query = {email, productId}
      const isExist = await cartCollection.findOne(query)
      if(isExist){
        return res.send({acknowledged:false})
      }
      const result = await cartCollection.insertOne(cart)
      res.send(result)
    })

    app.get('/cart', async(req, res)=>{
      const email = req.query.email
      const query = {email}
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/cart/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('bistro track server running')
})

app.listen(port, ()=>{
    console.log(`Server Running At port: ${port}`)
})