const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
/*
This middleware is used to hash user credentials before submitting them to the server.
*/

const saltRounds = 10;

// Generate salt
bcrypt.genSalt(saltRounds, function(error, salt) {
    // returns salt
  });

const hashCredentialsMiddleware = async (req, res, next) => {
    try {
        // Check if username and password are provided in the request body
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        console.log("checking generated salt: ", salt);

        if (req.body.email) {
            const hashedEmail = await bcrypt.hash(req.body.email, salt);
            req.body.email = hashedEmail;
        }

        // Hash credentials with bcrypt using 10 rounds of salting
        const hashedUsername = await bcrypt.hash(req.body.username, salt);
        console.log("checking salted username: ", hashedUsername);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Replace credentials with hashed versions
        req.body.username = hashedUsername;
        console.log("checking replaced username: ", req.body.username);
        req.body.password = hashedPassword;
        next();
    } catch (error) {
        // Handle any errors
        console.error('Error hashing credentials:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Middleware function to check authentication
const authMiddleware = (req, res, next) => {
    // Get the token from request headers
    const token = req.headers.authorization;

    if (!token) {
        // If token is not present, deny access
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    // Verify the token
    // replace token with an acutal secretkey ------------------------ importent
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            // If token is invalid, deny access
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }

        // If token is valid, set user information in request object
        req.user = decoded;
        next(); // Continue to the next middleware
    });
};


module.exports = hashCredentialsMiddleware, authMiddleware;