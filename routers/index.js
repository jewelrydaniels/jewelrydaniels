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
    // --- NUEVAS IMPORTACIONES ---
    mostrarPerfil,
    actualizarPerfil,
    eliminarCuenta,
    enviarEmailSuscripcion,
    agregarAlCarrito,
    mostrarCarrito,
    eliminarDelCarrito,
    finalizarCompra
} from "../Controllers/pcontroller.js";

const router = express.Router();

router.get('/', paginaInicio);
router.get('/joyas', protegerRuta, paginajoyas);
router.get('/admin', paginaAdministrador);
router.post('/admin', administradorinicio);
router.get('/joyas/:slug', informacionJoyas);
router.post('/resenias', crearComentario);
router.get('/historia', historia);

// --- RUTAS DE PERFIL / CONFIGURACIÓN ---
// Ver la página de configuración (protegida)
router.get('/perfil', protegerRuta, mostrarPerfil);

// Procesar el cambio de nombre o contraseña
router.post('/perfil/actualizar', protegerRuta, actualizarPerfil);

// Procesar el borrado de la cuenta
router.post('/perfil/eliminar', protegerRuta, eliminarCuenta);

// --- AUTENTICACIÓN ---
router.get('/login', (req, res) => res.render('login', { pagina: 'Iniciar Sesión' }));
router.post('/login', autenticarUsuario);
router.get('/registro', (req, res) => res.render('registro', { pagina: 'Crear Cuenta' }));
router.post('/registro', registrarUsuario);
router.get('/logout', cerrarSesion);
router.post('/suscribirse',enviarEmailSuscripcion)
router.post('/carrito/agregar', agregarAlCarrito);
router.get('/carrito', mostrarCarrito);
router.post('/carrito/eliminar', eliminarDelCarrito);
router.post('/finalizar-pago',finalizarCompra)
export default router;