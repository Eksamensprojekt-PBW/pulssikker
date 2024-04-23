// Requirements
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");

// MongoDB Client Connect
const uri =
  "mongodb+srv://pulssikker:Hejsa123@pulssikker.brk6urn.mongodb.net/?retryWrites=true&w=majority&appName=pulssikker";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Variables
const port = 3000;
const app = express();


const helmetConfig = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "example.com"],
      "style-src": null, // Disable stylesheets
    },
  },
  frameguard: {
    action: "deny",
  },
};

app.use(helmet(helmetConfig));

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/privat", (req, res) => {
  res.send("Hello world");
});

app.get("/erhverv", (req, res) => {
  res.send("Hello world");
});


// Application Configuration
app.listen(port, () => {
  console.log("Server is running on PORT 3000");
});
