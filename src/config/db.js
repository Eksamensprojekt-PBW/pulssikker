const { MongoClient, ServerApiVersion } = require('mongodb');

// Connects to the MongoDB database
const connectToDatabase = async (uri) => {
        const client = new MongoClient(uri, {
        serverApi: ServerApiVersion.v1,
        ssl: true,
        tlsAllowInvalidCertificates: false,
    });
  
    try {
      await client.connect();
      console.log('Successfully connected to MongoDB');
      return client;
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      process.exit(1);
    }
  };
  
  module.exports = connectToDatabase;