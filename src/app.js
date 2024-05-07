// ---------- | Import required modules | ----------
require("dotenv").config();
const morgan = require("morgan");
const winston = require("winston");
const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const fs = require("fs");
const courseRoutes = require("./routes/index");
const orderRoutes = require("./routes/order");
const uploadRouter = require("./routes/upload.js").router;
const connectToDatabase = require('./config/db.js');

// ---------- | Import routes | ----------
//const coursesRoutes = require("./routes/courses");
const loginRoutes = require("./routes/login");

// ---------- | Initialize App and Variables | ----------
// Variables
const port = process.env.PORT || 3000;
const app = express();

// ---------- | Configure App and middleware| ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Ensure logs directory exists
const logsDirectory = path.join(__dirname, "logs");
fs.existsSync(logsDirectory) || fs.mkdirSync(logsDirectory);

// Winston configuration with improved formatting
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} - ${info.level.toUpperCase()}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDirectory, "router.log"),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "exceptions.log"),
    }),
  ],
});

// Morgan setup to use Winston for logging all HTTP requests, including detailed descriptions
const morganMiddleware = morgan(
  function (tokens, req, res) {
    return `IPv6: ${tokens["remote-addr"](req, res)} - Method: ${tokens.method(
      req,
      res
    )} - URL: ${tokens.url(req, res)} - Status: ${tokens.status(
      req,
      res
    )} - Content-Length: ${tokens.res(
      req,
      res,
      "content-length"
    )} - Response-Time: ${tokens["response-time"](req, res)} ms`;
  },
  { stream: { write: (message) => logger.info(message.trim()) } }
);


// ---------- | Setup global middleware | ----------
app.use(morganMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Ensures cookies are sent over HTTPS. - set to true later
      httpOnly: false, // Prevents client-side JavaScript from reading the session cookie. - set to true later
      maxAge: 3600000, // gemmer session i 1 time
      sameSite: 'strict' // Can be 'strict', 'lax', or 'none' - skal lige se om det er nødvendig
                        // hvis ikke den bøvler så er det ekstar csrf beskyttlese
    },
  })
);

// ---------- | Use Routes | ----------

//app.use("/courses", coursesRoutes);


// ---------- | run application | ----------
async function run() {
  try {
    const client = await connectToDatabase(process.env.MONGO_URI);
    const db = client.db("FirstAidCourses");

    // Pass `db` into the routes
    app.use("/", courseRoutes(client));
    app.use("/", orderRoutes(db));
    app.use("/", loginRoutes(client));
    app.use((req, res) => {
      res.status(404).render("404");
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error(
        `Error: ${err.status || 500} - Message: ${err.message} - URL: ${
          req.originalUrl
        } - Method: ${req.method} - IP: ${req.ip}`
      );
      res.status(500).send("Something broke!");
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection:', reason);
      // handle the error safely
      
  });
  
  process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // handle the error safely
      
  });
  

    // Start the application
    app.listen(port, () => {
      console.log(`Application is running on http://localhost:${port}`);
      logger.info(`Server has started on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.error);
