// const express = require(`express`);
// // const path = require('path')
// const PORT = process.env.PORT || 3000;

// // express()
// //   .use(express.static(path.join(__dirname, 'public')))
// //   .set('views', path.join(__dirname, 'views'))
// //   .set('view engine', 'ejs')
// //   .get('/', (req, res) => res.render('pages/index'))
// //   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

// const app = express();
// const bodyParser = require(`body-parser`);
// const Database = require(`./db`);

// const jsonParser = bodyParser.json();

// app.get(`/`, async (req, res) => {
//     const continentCollection = Database.connection.then(client => client.db(`world`)).then(db => db.collection(`continent`));
//     const creatureCollection = Database.connection.then(client => client.db(`creature`)).then(db => db.collection(`illustration`));
//     let continents = await continentCollection.then(collection => collection.find().toArray());
//     const illustrations = await creatureCollection.then(collection => collection.find().toArray());
//     continents.forEach(continent => {
//         continent.regions.forEach(region => {
//             region.places.forEach(place => {
//                 place.creatures = place.creatures.map(creatureId => {
//                     return illustrations.find(illustration => {
//                         console.log(`${illustration._id} ${creatureId} ${illustration._id == creatureId}`)
//                         return illustration._id == creatureId;
//                     });
//                 });
//             });
//         });
//     });
//     res.json(continents);
// });

// app.post(`/creatures/:id`, jsonParser, async (req, res) => {
//     const creatureCollection = Database.connection.then(client => client.db(`creature`)).then(db => db.collection(`illustration`));
//     await creatureCollection.then(collection => collection.updateOne(
//         { 
//             _id: new Database.ObjectID(req.params.id)
//         },
//         {
//             $set: req.body
//         }
//     ));
//     const continentCollection = Database.connection.then(client => client.db(`world`)).then(db => db.collection(`continent`));
//     let continents = await continentCollection.then(collection => collection.find().toArray());
//     const illustrations = await creatureCollection.then(collection => collection.find().toArray());
//     continents.forEach(continent => {
//         continent.regions.forEach(region => {
//             region.places.forEach(place => {
//                 place.creatures = place.creatures.map(creatureId => {
//                     return illustrations.find(illustration => {
//                         console.log(`${illustration._id} ${creatureId} ${illustration._id == creatureId}`)
//                         return illustration._id == creatureId;
//                     });
//                 });
//             });
//         });
//     });
//     res.json(continents);
// });

// app.listen(PORT);

const { ApolloServer, gql, PubSub, } = require(`apollo-server`);
const { getCollection, ObjectID, } = require(`./db`);

const pubsub = new PubSub();

const EventsEnum = {
    DIED_TIME_UPDATED: `DIED_TIME_UPDATED`,
}

const typeDefs = gql`
    type Creature {
        _id: ID
        name: String
        refresh_rate: Int
        died_time: Int
        reborn_time: Int
    }

    type Query {
        creatures: [Creature]
    }

    type Mutation {
        updateDiedTime(input: UpdateDiedTimeInput): Creature
    }

    type Subscription {
        diedTimeUpdated: Creature
    }

    input UpdateDiedTimeInput {
        _id: ID
        died_time: Int
        reborn_time: Int
    }
`;

const resolvers = {
    Query: {
        creatures: async () => {
            const collection = await getCollection();
            return collection.find({}).toArray();
        },
    },
    Mutation: {
        updateDiedTime: async (_, args) => {
            let { input, } = args;
            const collection = await getCollection();
            input._id = new ObjectID(input._id);

            console.log(input);

            const query = { _id: input._id }
            const set = { $set: input }
            await collection.updateOne(query, set);

            const result = await collection.findOne(query);
            pubsub.publish(EventsEnum.DIED_TIME_UPDATED, { diedTimeUpdated: result });

            return result;
        },
    },
    Subscription: {
        diedTimeUpdated: {
            subscribe: () => pubsub.asyncIterator([ EventsEnum.DIED_TIME_UPDATED ]),
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers, });
server.listen();