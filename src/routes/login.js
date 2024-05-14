const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Module exports a function that sets up routing for user authentication
module.exports = (client) => {
    const userController = require("../controllers/usercontroller")(client);
    router.post('/login', [ body('username').trim().escape(), body('password').trim()], userController.loginUser);
    router.post('/registrer', [ 
        body('username').trim().escape(),
        body('password').isLength({ min: 16 }).withMessage('Password must be at least 16 characters long'),
        body('email').isEmail().normalizeEmail()],
        userController.signupUser);
    router.get('/login', userController.getLoginPage);
    router.get('/registrer', userController.getSignupPage);
    router.get('/logout', userController.logoutUser);

    return router;
};