require(`dotenv`).config();
const { MongoClient, ObjectID } = require(`mongodb`);
const { MONGODB_URI, } = process.env;

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const connection = client.connect();
const getCollection = () => connection.then(() => client.db(`v4db`)).then(db => db.collection(`creature`));

module.exports = {
    getCollection,
    ObjectID,
};