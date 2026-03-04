import express from 'express';
import session from 'express-session'; // 1. ¡IMPORTANTE! Tienes que importar esto
import router from './routers/index.js';
import db from './config/db.js';

const app = express();

// Conexión a DB
db.authenticate()
    .then(() => console.log('Conectado a la base de datos!'))
    .catch(err => console.log(err));

const port = process.env.PORT || 4000;

// Habilitar PUG
app.set('view engine', 'pug');

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. CONFIGURAR SESSION (Debe ir ANTES de usar res.locals.usuario)
app.use(session({
    secret: 'joyeriadaniel',
}));
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.carrito = req.session.carrito || []; // <--- ESTO ES VITAL
    next();
});
// 3. MIDDLEWARES GLOBALES
app.use((req, res, next) => {
    const year = new Date().getFullYear();
    res.locals.year = year;
    res.locals.nombreP = 'Joyeria';

    // Ahora que la sesión está configurada arriba, ya podemos usarla aquí
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Carpeta pública
app.use(express.static('public'));

// 4. RUTAS (Siempre al final)
app.use('/', router);

app.listen(port, () => {
    console.log('Express server listening on port ' + port);
});