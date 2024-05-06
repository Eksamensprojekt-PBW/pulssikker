// models/user.js
async function getUsersCollection(client) {
    return client.db("Accounts").collection("users");
}

module.exports = getUsersCollection;

