const {MongoClient} = require("mongodb");
const Express = require("express");
const BodyParser = require("body-parser");

const port = 3000

// Pull cluster uri from config.json and init client
const config = require("./config.json");
const client = new MongoClient(config.dbURI, { useNewUrlParser: true, useUnifiedTopology:true });

const server = Express();
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({extended:true}));

let userCollection;


server.get("/", (req, res) => {
    res.send("Hello World");
});

server.listen(port, async () => {
    try {
        // Connect to the cluster
        await client.connect();
        userCollection = client.db("Lantern").collection("LanternUsers");
        console.log("Connected to MongoDB Lantern database");
        console.log("Server listening on port " + port);
    } catch (e) {
        console.log(e);
    }
});