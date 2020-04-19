const express = require(`express`);
// const path = require('path')
// const PORT = process.env.PORT || 5000

// express()
//   .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
//   .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${ PORT }`))

const app = express();
const Database = require(`./db`);

app.get(`/`, async (req, res) => {
    const collection = Database.connection.then(client => client.db(`creature`)).then(db => db.collection(`illustration`));
    const array = await collection.then(collection => collection.find().toArray());
    res.json(array);
});
// app.post(`/creatures/{id}`)

app.listen(3000);