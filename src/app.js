// Requirements
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const fs = require("fs");
const passport = require("passport");
const flash = require("express-flash");
const { v4: uuidv4 } = require("uuid");
const courseRoutes = require("./routes/index");
const orderRoutes = require("./routes/order");
const uploadRoute = require('./routes/upload');


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
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use('/upload', uploadRoute);

/*
app.use(flash());
app.use(session({
  //move uuidv4 to a scretkey value, and move it to .env enviroment
  secret: uuidv4(),
  resave: false,
  saveUninitialized: false,
}));
//app.use(passport.initialize());
//app.use(passport.session());
*/

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    ssl: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
    tlsAllowInvalidCertificates: false,
  },
});

// const helmetConfig = {
//   contentSecurityPolicy: {
//     useDefaults: true,
//     directives: {
//       "script-src": ["'self'"],
//       "style-src": ["'self'"],
//       "img-src": ["'self'"],
//     },
//   },
//   frameguard: {
//     action: "deny",
//   },
// };

// app.use(helmet(helmetConfig));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

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
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const db = client.db("FirstAidCourses");

    // Pass `db` into the routes
    app.use("/", courseRoutes(db));
    app.use("/", orderRoutes(db));

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
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}
run().catch(console.error);
