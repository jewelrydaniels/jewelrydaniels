import express from 'express';

import {
    informacionJoyas,
    paginaInicio,
    paginajoyas,
    crearComentario,
    historia,
    paginaAdministrador,
    administradorinicio,
    autenticarUsuario,
    registrarUsuario,
    cerrarSesion,
    protegerRuta,
    mostrarPerfil,
    actualizarPerfil,
    eliminarCuenta,
    enviarEmailSuscripcion,
    agregarAlCarrito,
    mostrarCarrito,
    eliminarDelCarrito,
    finalizarCompra,
    mostrarLogin,
    mostrarRegistro
} from "../Controllers/pcontroller.js";

const router = express.Router();

router.get('/', paginaInicio);
router.get('/joyas', protegerRuta, paginajoyas);
router.get('/admin', paginaAdministrador);
router.post('/admin', administradorinicio);
router.get('/joyas/:slug', informacionJoyas);
router.post('/resenias', crearComentario);
router.get('/historia', historia);

router.get('/perfil', protegerRuta, mostrarPerfil);
router.post('/perfil/actualizar', protegerRuta, actualizarPerfil);
router.post('/perfil/eliminar', protegerRuta, eliminarCuenta);

router.get('/login', mostrarLogin);
router.post('/login', autenticarUsuario);
router.get('/registro', mostrarRegistro);
router.post('/registro', registrarUsuario);
router.get('/logout', cerrarSesion);
router.post('/suscribirse',enviarEmailSuscripcion)
router.post('/carrito/agregar', agregarAlCarrito);
router.get('/carrito', mostrarCarrito);
router.post('/carrito/eliminar', eliminarDelCarrito);
router.post('/finalizar-pago',finalizarCompra)
export default router;