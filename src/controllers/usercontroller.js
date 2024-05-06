// ---------- | Import required modules | ----------
const bcrypt = require('bcrypt');
const getUsersCollection = require("../models/user");

// ---------- | User controller | ----------
// This is for defining logic for the login/signup 
module.exports = (client) => {

    getLoginPage = (req, res) => {
        const errorMessage = req.session.errorMessage || null;
        req.session.errorMessage = null; // Clear the error message after reading
        res.render("login", { errorMessage });
    };

    getSignupPage = (req, res) => {
        const errorMessage = req.session.errorMessage || null;
        req.session.errorMessage = null; // Clear the error message after reading
        res.render("registrer", { errorMessage });
    };

    const loginUser = async (req, res) => {
        try {
            const usersCollection = await getUsersCollection(client);
            const user = await usersCollection.findOne({ username: req.body.username });
    
            if (!user) {
                // If the user it not found
                req.session.errorMessage = 'User does not exist';
                res.redirect('/login');
            } else {
                // Check if password matches
                const passwordMatch = await bcrypt.compare(req.body.password, user.password);
                
                if (passwordMatch) {
                    // If password matches, log in the user
                    req.session.user = user;
                    req.session.errorMessage = null; // Clear any previous error message
                    res.redirect('/dashboard');
                } else {
                    // If password does not match
                    req.session.errorMessage = 'Invalid credentials';
                    res.redirect('/login');
                }
            }
        } catch (error) {
            // General error message
            req.session.errorMessage = `Error: ${error.message}`;
            res.redirect('/login');
        }
    };

    const signupUser = async (req, res) => {
        try {
            const { username, password, email } = req.body;
    
            // Regex for password validation
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
    
            // Validate the password against the regex
            if (!passwordRegex.test(password)) {
                req.session.errorMessage = 'Password invalid';
                return res.redirect('/registrer');
            }
    
            // Get the users collection
            const usersCollection = await getUsersCollection(client);
    
            // Check if the user already exists by username or email
            const existingUser = await usersCollection.findOne({username});
    
            if (existingUser) {
                req.session.errorMessage = 'User already exists';
                return res.redirect('/registrer');
            }
    
            // Hash the password before storing
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // Insert the new user into the collection
            await usersCollection.insertOne({
                username,
                password: hashedPassword,
                email
            });
    
            res.redirect('/login');
        } catch (error) {
            // Handle any unexpected errors and send a response to the client
            res.status(500).send(`Error: ${error.message}`);
        }
    };
    

    return {
        getLoginPage,
        getSignupPage,
        loginUser,
        signupUser,
    };
};