// ---------- | Import required modules | ----------
require("dotenv").config();
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
const uploadRouter = require("./routes/upload.js").router;
const connectToDatabase = require('./config/db.js');

// ---------- | Import routes | ----------
const coursesRoutes = require("./routes/courses");


/*
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
);
*/

// ---------- | Initialize App and Variables | ----------
const port = 3000;
const app = express();

const uri = process.env.MONGO_URI;

// ---------- | Configure App | ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- | Setup middleware | ----------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

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
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    name: "MySessionID",
    cookie: {
      httpOnly: false,
      maxAge: 3600000, // gemmer session i 1 time
      // secure: true //Only works with https not localhost set to true when put up
    },
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

// ---------- | Use Routes | ----------

app.use("/courses", coursesRoutes);



// ---------- | run application | ----------
async function run() {
  try {
    const client = await connectToDatabase(uri);
    const db = client.db("FirstAidCourses");

    // Pass `db` into the routes
    app.use("/", courseRoutes(client));
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
