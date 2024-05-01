require("dotenv").config();

const { MongoClient } = require("mongodb");
const MONGOOSE = require("mongoose");
const CONNECT = MONGOOSE.connect("")

async function connectToDatabase() {
    const uri = process.env.MONGO_URI;

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Succesfully connected to the database');

        return client.db();
        await listDatabases(client);
    } catch (error) {
        console.log(error)
    } finally {
        await client.close();
    }
}

main().catch(console.error);


//---------- database test function -----------
//---------- remove in finale build -----------

async function listDatabases(client) {
    const databaseList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databaseList.databases.forEach(db => {
        console.log(`- ${db.name}`)
    });
}

//Check database connection
CONNECT.then(() => {
    console.log("Database Connected Succesfully");
})
.catch(() => {
    console.log("Database Failed to Connect");
});

//Create schema  
const LoginSchema = new MONGOOSE.Schema({
    email: {
        type: string,
        required: true
    },
    name: {
        type: string,
        required: true
    },
    password: {
        type: string,
        required: true
    }
});



//Collection
const collection = new MONGOOSE.model("users", LoginSchema);

//Export module
module.exports = collection;

