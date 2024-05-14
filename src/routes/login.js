const express = require('express');
const router = express.Router();

// Module exports a function that sets up routing for user authentication
module.exports = (client) => {
    const userController = require("../controllers/usercontroller")(client);
    router.get('/login', userController.getLoginPage);
    router.post('/login', userController.loginUser);
    router.get('/registrer', userController.getSignupPage);
    router.post('/registrer', userController.signupUser);
    router.get('/logout', userController.logoutUser);

    return router;
};