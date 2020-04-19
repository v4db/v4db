require(`dotenv`).config();
const { MongoClient, ObjectID } = require(`mongodb`);
const { MONGODB_URI, } = process.env;

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const connection = client.connect().then(() => {
    console.log(`Database ready`);
    return client;
});

module.exports = {
    connection,
    ObjectID,
};