/* Following MCV practices, this controller acts as an
 intermediary between the Model and the View. 
 It handles user inputs nd updates the Model 
 accordingly, and it also updates the View 
 based on changes in the Model.

 userController handles CRUD operations for user related
 database task
*/

//currently not working

const UserModel = require("../models/user");

async function createUser(req, res) {
    try {
        const userId = await UserModel.createUser(req.body);
        res.json({ success: true, userId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

async function getUser(req, res) {
    try {
        const user = await UserModel.getUserById(req.params.id);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

async function updateUser(req, res) {
    try {
        await UserModel.updateUser(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

async function deleteUser(req, res) {
    try {
        await UserModel.deleteUser(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser
};
