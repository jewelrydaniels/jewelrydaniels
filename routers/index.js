import express from 'express';

import {
    informacionJoyas,
    paginaInicio, paginajoyas, paginaprueba,crearComentario,resenias,historia
} from "../Controllers/pcontroller.js";

const router = express.Router();


router.get('/',paginaInicio);
router.get('/joyas',paginajoyas);
router.get('/joyas/:slug',informacionJoyas);
router.post('/resenias', crearComentario);
router.get('/resenias',resenias);
router.get('/historia',historia);
export default router;