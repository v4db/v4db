require(`dotenv`).config();
const { MongoClient, ObjectID } = require(`mongodb`);
const { MONGODB_URI, } = process.env;

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const connection = client.connect();
const getCollection = (collection) => connection.then(() => client.db(`v4db`)).then(db => db.collection(collection));
const collections = {
    creature: getCollection(`creature`),
    type: getCollection(`type`),
}

module.exports = {
    collections,
    ObjectID,
};