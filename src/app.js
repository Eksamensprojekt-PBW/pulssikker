// Requirements
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const helmet = require("helmet");
const courseRoutes = require("./routes/index");

// Variables
const port = 3000;
const app = express();
// MongoDB Client Connect
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const pingResult = await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB", pingResult);

    // Here you can pass the client or specific collections to your routes
    app.use("/", courseRoutes(client));

    // Routes can be here if they don't need database access
    app.get("/", (req, res) => {
      res.send("Hello world");
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on PORT ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

run().catch(console.error);
