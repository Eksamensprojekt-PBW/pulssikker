/* Following MCV practices, this controller acts as an
 intermediary between the Model and the View. 
 It handles user inputs nd updates the Model 
 accordingly, and it also updates the View 
 based on changes in the Model.

 userController handles CRUD operations for user related
 database task
*/

// ---------- | Import required modules | ----------
// controllers/userController.js
const bcrypt = require('bcrypt');
const getUsersCollection = require("../models/user");

// ---------- | export | ----------
// Route for login view

module.exports = (client) => {

    getLoginPage = (req, res) => {
        const errorMessage = req.session.errorMessage || null;
        req.session.errorMessage = null; // Clear the error message after reading
        res.render("login", { errorMessage });
    };

    getSignupPage = (req, res) => {
        res.render("registrer");
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

    signupUser = async (req, res) => {
        try {
            const usersCollection = await getUsersCollection(client);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            await usersCollection.insertOne({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email
            });
    
            const newUser = await usersCollection.findOne({ username: req.body.username });
            req.session.user = newUser;
            res.redirect('/login');
        } catch (error) {
            res.status(500).send(error);
        }
    };

    return {
        getLoginPage,
        getSignupPage,
        loginUser,
        signupUser,
    };
}

// router.post("/login", async (req, res) => {
//     try {
//       console.log("Trying to login user"); // remove this latter?
//       // Extract user data from the request body
//       const { username, password } = req.body;
//       // Check if user exists
//       const user = await accountsCollection.findOne({ username });
//       if (!user) {
//         // If user not fount, return a 401 Unauthorized response
//         return res.status(401).json({ error: "User not found" });
//       }
//       // Compare the hashed password with the stored hashed password
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (!passwordMatch) {
//         // If passwords don't match, return a 401 Unauthorized response
//         return res.status(401).json({ error: "Invalid credentials" });
//       }
//       // If the credentials are valid, generate a JWT token
//       //const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour

//       console.log("succesfull login");
//       res.redirect("/dashboard");
//     } catch (error) {
//       console.error("Error loging in:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });



//   // Route for adding a user
//   router.post("/registrer", async (req, res) => {
//     try {
//       console.log("Adding a user");
//       // Extract user data from the request body
//       const { email, username, password } = req.body;

//       // Check if user already exists
//       const existingUser = await accountsCollection.findOne({ username });
//       if (existingUser) {
//         return res.status(400).json({ error: "User already exists" });
//       }
//       // Generate a salt
//       const salt = await bcrypt.genSalt(10);
//       // Hash the password using bcrypt with the generated salt
//       const hashedPassword = await bcrypt.hash(password, salt);
//       // Insert the course data into the appropriate collection
//       await accountsCollection.insertOne({
//         email: email,
//         username: username,
//         password: hashedPassword,
//       });
//       console.log("User successfully added.");
//       // Redirect based on Swal result (optional)
//       res.redirect("/login");
//     } catch (error) {
//       console.error("Error adding user:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   });








// //currently not working

// const UserModel = require("../models/user");

// async function createUser(req, res) {
//     try {
//         const userId = await UserModel.createUser(req.body);
//         res.json({ success: true, userId });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// }

// async function getUser(req, res) {
//     try {
//         const user = await UserModel.getUserById(req.params.id);
//         res.json({ success: true, user });
//     } catch (error) {
//         console.error('Error getting user:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// }

// async function updateUser(req, res) {
//     try {
//         await UserModel.updateUser(req.params.id, req.body);
//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// }

// async function deleteUser(req, res) {
//     try {
//         await UserModel.deleteUser(req.params.id);
//         res.json({ success: true });
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// }

// module.exports = {
//     createUser,
//     getUser,
//     updateUser,
//     deleteUser
// };
