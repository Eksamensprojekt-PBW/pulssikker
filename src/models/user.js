//currently not working

/*
This user scripts is where the data logic resides. 
It interacts directly with the database.
*/

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();


// Connection URI for MongoDB
const uri = process.env.MONGO_URI;

// Initialize MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const accountDB = client.db("Accounts");

// Connect to Database
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Succesfully Connected to the database');
        return client.db(accountDB).collection('users');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

// Create new user
async function createUser(user) {
    const collection = await connectToDatabase();
    const result = await collection.insertOne(user);
    return result.insertedId;
}

// Get user by ID
async function getUserById(userId) {
    const collection = await connectToDatabase();
    return collection.findOne({ _id: ObjectId(userId) });
}

// Update user
async function updateUser(userId, updatedUserData) {
    const collection = await connectToDatabase();
    await collection.updateOne({ _id: ObjectId(userId) }, { $set: updatedUserData });
}

// Delete user
async function deleteUser(userId) {
    const collection = await connectToDatabase();
    await collection.deleteOne({ _id: ObjectId(userId) });
}

module.exports = {
    createUser,
    getUserById,
    updateUser,
    deleteUser
};
