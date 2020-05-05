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

const { ApolloServer, gql, } = require(`apollo-server`);
const { collections, ObjectID, } = require(`./db`);

const typeDefs = gql`
    type Icon {
        name: String
        slant: Int
        color: String
    }

    type Creature {
        _id: ID
        name: String
        refresh_rate: Int
        reborn_time: Int
        icon: Icon
        typeId: String
        type: CreatureType
        patch_time: Int
    }

    type CreatureType {
        _id: ID
        name: String
        color: String
    }

    type Query {
        creatures: [Creature]
        types: [CreatureType]
    }

    type Mutation {
        updateDiedTime(input: UpdateDiedTimeInput): Creature
    }

    input UpdateDiedTimeInput {
        _id: ID
        died_time: Int
        reborn_time: Int
        is_patch: Int
    }
`;

const resolvers = {
    Creature: {
        type: async (parent) => {
            console.log(parent);
            const query = { _id: new ObjectID(parent.typeId), };
            const collection = await collections.type;
            return collection.findOne(query);
        },
    },
    Query: {
        creatures: async () => {
            const collection = await collections.creature;
            return collection.find({}).toArray();
        },
        types: async () => {
            const collection = await collections.type;
            return collection.find({}).toArray();
        },
    },
    Mutation: {
        updateDiedTime: async (_, args) => {
            let { input, } = args;
            const collection = await collections.creature;
            input._id = new ObjectID(input._id);
            let inc = null;

            if(input.is_patch) {
                inc = { patch_time: 1, };
            } else {
                input.patch_time = 0;
            }

            delete input.is_patch;

            const query = { _id: input._id }
            const set = { $set: input, $inc: inc, }
            await collection.updateOne(query, set);

            return await collection.findOne(query);
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers, });
server.listen({ port: process.env.PORT || 4000 });