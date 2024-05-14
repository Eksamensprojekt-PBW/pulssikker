// model for getting the user collection from the mongoDB Cluster
async function getUsersCollection(client) {
    return client.db("Accounts").collection("users");
}

module.exports = getUsersCollection;

