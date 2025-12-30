import express from 'express';
import router from './routers/index.js';
import db from './config/db.js';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
db.authenticate()
    .then(() => console.log('Conectado a la base de datos!'))
    .catch(err => console.log(err));
const port = process.env.PORT || 4000;

app.set('view engine', 'pug');

app.use((req,res,next) => {
    const year = new Date().getFullYear();
    res.locals.year = year;
    res.locals.nombreP = 'Joyeria';
    next();
})

app.use(express.static('public'));


app.use('/' , router);


app.listen(port, () => {
    console.log('Express server listening on port ' + port);
})