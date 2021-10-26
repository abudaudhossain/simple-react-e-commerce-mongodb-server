const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqqvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("online_shop");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection('orders');

        app.get('/products', async (req, res) => {

            const page = req.query.page;
            const size = parseInt(req.query.size);

            const cursor = productsCollection.find({});
            const count = await cursor.count();

            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();

            } else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        });



        // Use post get data by keys
        app.post('/products/byKeys', async (req, res) =>{
            const keys = req.body;
            const query = { key: { $in: keys}};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();


            res.json(products);
        });
        //Order collection api
        app.post('/order', async(req, res) =>{
            console.log(req.body);
            const order = req.body;

            const result = await ordersCollection.insertOne(order);
            // console.log(result);
            res.send(result);
        } )

    } finally {
        // client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Simple react e-commerce server");
})

app.listen(port, () => {
    console.log("Our e-commerce server is running in port: ", port);
})