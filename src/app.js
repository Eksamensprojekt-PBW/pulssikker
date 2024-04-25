// Requirements
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const fs = require("fs");
const courseRoutes = require("./routes/index");
const passport = require("passport");
const flash = require("express-flash");
const { v4: uuidv4 } = require('uuid');

/*
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
);
*/

// Variables
const port = 3000;
const app = express();
const users = [];

// MongoDB Client Connect
const uri = process.env.MONGO_URI;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  //move uuidv4 to a scretkey value, and move it to .env enviroment
  secret: uuidv4(),
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

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
    /*app.get("/", (req, res) => {
        res.send("Hello world");
      });
    */

    app.use((req, res) => {
      res.status(404).render("404");
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
