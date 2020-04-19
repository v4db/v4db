const express = require(`express`);
// const path = require('path')
const PORT = process.env.PORT || 3000;

// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const app = express();
const bodyParser = require(`body-parser`);
const Database = require(`./db`);

const jsonParser = bodyParser.json();

app.get(`/`, async (req, res) => {
    const continentCollection = Database.connection.then(client => client.db(`world`)).then(db => db.collection(`continent`));
    const creatureCollection = Database.connection.then(client => client.db(`creature`)).then(db => db.collection(`illustration`));
    let continents = await continentCollection.then(collection => collection.find().toArray());
    const illustrations = await creatureCollection.then(collection => collection.find().toArray());
    continents.forEach(continent => {
        continent.regions.forEach(region => {
            region.places.forEach(place => {
                place.creatures = place.creatures.map(creatureId => {
                    return illustrations.find(illustration => {
                        console.log(`${illustration._id} ${creatureId} ${illustration._id == creatureId}`)
                        return illustration._id == creatureId;
                    });
                });
            });
        });
    });
    res.json(continents);
});

app.post(`/creatures/:id`, jsonParser, async (req, res) => {
    const creatureCollection = Database.connection.then(client => client.db(`creature`)).then(db => db.collection(`illustration`));
    await creatureCollection.then(collection => collection.updateOne(
        { 
            _id: new Database.ObjectID(req.params.id)
        },
        {
            $set: req.body
        }
    ));
    const continentCollection = Database.connection.then(client => client.db(`world`)).then(db => db.collection(`continent`));
    let continents = await continentCollection.then(collection => collection.find().toArray());
    const illustrations = await creatureCollection.then(collection => collection.find().toArray());
    continents.forEach(continent => {
        continent.regions.forEach(region => {
            region.places.forEach(place => {
                place.creatures = place.creatures.map(creatureId => {
                    return illustrations.find(illustration => {
                        console.log(`${illustration._id} ${creatureId} ${illustration._id == creatureId}`)
                        return illustration._id == creatureId;
                    });
                });
            });
        });
    });
    res.json(continents);
});

app.listen(PORT);