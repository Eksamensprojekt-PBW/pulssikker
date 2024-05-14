// ---------- | Import required modules | ----------
const bcrypt = require('bcrypt');
const getUsersCollection = require("../models/user");
const { validationResult } = require('express-validator');

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('login', { errors: errors.array() });
        }

        try {
            const usersCollection = await getUsersCollection(client);
            const user = await usersCollection.findOne({ username: req.body.username });
    
            if (!user) {
                req.session.errorMessage = 'User does not exist';
                return res.redirect('/login');
            }
            
            const passwordMatch = await bcrypt.compare(req.body.password, user.password);
            if (!passwordMatch) {
                req.session.errorMessage = 'Invalid credentials';
                return res.redirect('/login');
            }
    
            // Handle session regeneration and user login
            req.session.regenerate(error => {
                if (error) {
                    req.session.errorMessage = `Session error: ${err.message}`;
                    return res.redirect('/login');
                }
                req.session.user = { id: user._id, username: user.username };
                req.session.errorMessage = null; // Clear any previous error message
                res.redirect('/dashboard');
            });  
        } catch (error) {
            req.session.errorMessage = `Error: ${error.message}`;
            res.redirect('/login');
        }
    };
    

    const signupUser = async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('signup', { errors: errors.array() });
        }
        
        try {
            const { username, password, repeatPassword, email } = req.body;
    
            // Regex for password validation
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z\d'"\s\\]).{16,}$/g;

            // Validate if password matches repeated password
            if (password !== repeatPassword) {
            req.session.errorMessage = 'Passwords matcher ikke';
            return res.redirect('/registrer');
            }
    
            // Validate the password against the regex
            if (!passwordRegex.test(password)) {
                req.session.errorMessage = 'Password mødder ikke sikkerheds kritierne';
                return res.redirect('/registrer');
            }
    
            const usersCollection = await getUsersCollection(client);
    
            // Check for existing user
            const existingUser = await usersCollection.findOne({username});
            if (existingUser) {
                req.session.errorMessage = 'brugeren eksistere allerede';
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
    
            // Redirect to login after successful registration
            req.session.errorMessage = null;  // Clear any previous error messages
            res.redirect('/login');
        } catch (error) {
            // Handle any unexpected errors and send a response to the client
            req.session.errorMessage = `Error: ${error.message}`;
            res.redirect('/registrer');
        }
    };

    const logoutUser = (req, res) => {
        req.session.destroy(error => {
            if (error) {
                return res.redirect('/dashboard');
            }
            res.clearCookie('MySessionID');
            res.redirect('/login');
        });
    } 

    return {
        getLoginPage,
        getSignupPage,
        loginUser,
        signupUser,
        logoutUser
    };
};