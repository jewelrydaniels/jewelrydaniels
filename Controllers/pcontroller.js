import { Cliente } from "../models/Cliente.js";
import { Empleado } from "../models/Empleado.js";
import { Joya } from "../models/Joya.js";
import { Comentario } from "../models/Comentario.js";
import { Admin } from "../models/admin.js";
import {Usuario} from "../models/Usuario.js";
import {Compra} from "../models/Compra.js";
import bcrypt from 'bcrypt';

const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        return next(); // si hay session activa, el return next deja de ejecutar codigo de la funcion para dar paso a la pagina
    }
    res.redirect('/login');
};
import nodemailer from 'nodemailer';

const enviarEmailSuscripcion = async (req, res) => {
    const { email } = req.body;

    //Utilizo variables de entorno para evitar filtrar informacion
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure:true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP
        }
    });

    //
    const mailOptions = {
        from: '"Daniel\'s Jewelry" <noreply@daniels.com>',
        to: email, // El correo que el usuario escribió en el footer
        subject: "¡Bienvenido al Círculo Daniel's! ",
        text: "Gracias por suscribirte a nuestras novedades exclusivas.",
        html: `
            <div style="font-family: sans-serif; text-align: center;">
                <h1 style="color: #d4af37;">¡Bienvenido al Círculo Daniel's!</h1>
                <p>Gracias por unirte. Pronto recibirás nuestras colecciones exclusivas antes que nadie.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
        console.error(error.message);
    }
};
const paginaInicio = async (req, res) => {
    try {
        const joyas = await Joya.findAll({ limit: 3 });
        res.render('inicio', {
            pagina: 'Inicio',
            joya: joyas,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar la página de inicio');
    }
};
// Añadir al carrito
const agregarAlCarrito = async (req, res) => {
    const { id_joya } = req.body;

    try {
        const joya = await Joya.findByPk(id_joya);

        if (!req.session.carrito) {
            req.session.carrito = [];
        }

        const existe = req.session.carrito.find(item => item.id === parseInt(id_joya));

        if (!existe) {
            req.session.carrito.push({
                id: joya.id_joya,
                nombre: joya.nombre,
                precio: joya.precio,
                imagen: joya.imagen,
                cantidad: 1
            });
        } else {
            existe.cantidad++;
        }
        res.redirect('/carrito');

    } catch (error) {
        console.log(error);
        res.redirect('/joyas');
    }
};const finalizarCompra = async (req, res) => {
    console.log("1. Entrando en finalizarCompra...");

    const { carrito, usuario } = req.session;

    if (!usuario) return res.redirect('/login');
    if (!carrito || carrito.length === 0) return res.redirect('/joyas');

    try {
        console.log("2. Guardando en BD...");
        for (const item of carrito) {
            await Compra.create({
                nombre_joya: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                email_cliente: usuario.email,
                nombre_cliente: usuario.nombre
            });
        }

        console.log("3. Generando contenido detallado del Email...");

        // --- AQUÍ CONSTRUIMOS LA INFORMACIÓN EXTRA ---
        let productosHtml = "";
        let totalCompra = 0;

        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            totalCompra += subtotal;
            productosHtml += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.nombre}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.precio}€</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${subtotal.toFixed(2)}€</td>
                </tr>
            `;
        });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP
            }
        });

        // Email con diseño de tabla y total
        await transporter.sendMail({
            from: '"Daniel\'s Jewelry" <noreply@daniels.com>',
            to: usuario.email,
            subject: " Confirmación de tu pedido en Daniel's Jewelry",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #d4af37; text-align: center;">¡Gracias por tu compra, ${usuario.nombre}!</h2>
                    <p>Hemos procesado tu pedido correctamente. Aquí tienes los detalles:</p>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="text-align: left; padding: 10px;">Producto</th>
                                <th style="padding: 10px;">Cant.</th>
                                <th style="text-align: right; padding: 10px;">Precio</th>
                                <th style="text-align: right; padding: 10px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHtml}
                        </tbody>
                    </table>
                    
                    <div style="text-align: right; margin-top: 20px; font-size: 18px;">
                        <strong>Total pagado: <span style="color: #d4af37;">${totalCompra.toFixed(2)}€</span></strong>
                    </div>
                    
                    <p style="margin-top: 40px; font-size: 12px; color: #777; text-align: center;">
                        Esperamos que disfrutes de tus nuevas joyas. <br> 
                        Daniel's Jewelry - Lujo y Exclusividad.
                    </p>
                </div>
            `
        });

        console.log("4. Email enviado y limpiando carrito...");
        req.session.carrito = [];

        res.render('confirmacion', {
            pagina: '¡Gracias por tu compra!',
            usuario
        });

    } catch (error) {
        console.log("--- ERROR DETECTADO ---");
        console.error(error);
        res.redirect('/carrito');
    }
};
const eliminarDelCarrito = (req, res) => {
    const { id_joya } = req.body;

    // Verificamos si existe el carrito en la sesión
    if (req.session.carrito) {
        // Filtramos: "Quédate con todos los que NO tengan este ID"
        // Usamos != para comparar string vs number sin problemas, o parseInt
        req.session.carrito = req.session.carrito.filter(item => item.id != id_joya);
    }

    // Redirigimos de vuelta al carrito para ver los cambios
    res.redirect('/carrito');
};
const mostrarCarrito = (req, res) => {
    res.render('carrito', {
        pagina: 'Mi Carrito de Compras',
        carrito: req.session.carrito || []
    });
};
const paginaAdministrador = async (req, res) => {
    res.render('admin', {
        pagina: 'Administrador',
    })
}
const autenticarUsuario = async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.render('login', { pagina: 'Login', errores: [{mensaje: 'Usuario no existe'}] });
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (passwordCorrecto) {
        req.session.usuario = {/* asi puedo usar la session en toda la pagina web*/
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        };

        res.redirect('/joyas');
    } else {
        res.render('login', { pagina: 'Login', errores: [{mensaje: 'Password incorrecto'}] });
    }
}
const cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');// nos dirige al index al cerrar la sesion
    });
};

const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        await Usuario.create({
            nombre,
            email,
            password
        });

        // Una vez creado, redirigimos al login
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.render('registro', {
            pagina: 'Crear Cuenta',
            errores: [{mensaje: 'Hubo un error o el correo ya existe'}]
        });
    }
};
const administradorinicio = async (req, res) => {
    const { nombre, clave } = req.body;

    try {
        // Consulta con Sequelize
        const resultado = await Admin.findOne({
            where: {
                nombre: nombre,
                clave: clave
            }
        });

        if (!resultado) {
            return res.status(401).send('Usuario o contraseña incorrectos');
        }
        res.render('panel', {
            nombre: nombre,
            pagina: 'Panel',
        })

    } catch (error) {
        console.error(error);
        res.status(500).send('Error del servidor');
    }
};
const paginajoyas = async (req, res) => {
    try {
        const joyas = await Joya.findAll();
        res.render('joyas', {
            pagina: 'Joyas',
            joya: joyas,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar las joyas');
    }
};

// Información de una joya y sus comentarios
const informacionJoyas = async (req, res) => {
    const { slug } = req.params;
    const joyas = await Joya.findAll({ limit: 3 });
    try {
        const resultado = await Joya.findOne({
            where: { slug },
            include: [{ model: Comentario, as: 'comentarios' }] // alias
        });

        if (!resultado) {
            return res.status(404).send('Joya no encontrada');
        }

        res.render('joyai', {
            pagina: 'Información de Joyas',
            resultado,
            joya : joyas,
            comentarios: resultado.comentarios || [] // array vacío si no hay comentarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la joya');
    }
};
// 1. Mostrar la página de perfil
// pcontroller.js

const mostrarPerfil = async (req, res) => {
    const { msg } = req.query;

    // 1. Extraemos el email del usuario que tiene la sesión iniciada
    const { email } = req.session.usuario;

    try {
        // 2. Consultamos la tabla 'compras' filtrando por ese email
        // Usamos 'findAll' para traer todas las filas que coincidan
        const compras = await Compra.findAll({
            where: { email_cliente: email },
            order: [['fecha', 'DESC']] // Para que la última compra salga arriba
        });

        // 3. Renderizamos la vista pasando el array 'compras'
        res.render('perfil', {
            pagina: 'Mi Perfil',
            msg,
            compras // Esta es la variable que "nace" de la base de datos
        });

    } catch (error) {
        console.error("Error al obtener el historial:", error);
        res.render('perfil', {
            pagina: 'Mi Perfil',
            msg,
            compras: [] // Enviamos array vacío si algo falla para evitar errores en PUG
        });
    }
};
// 2. Actualizar datos
const actualizarPerfil = async (req, res) => {
    const { nombre, password } = req.body;
    const { id } = req.session.usuario;//al obtener el id de la sesion no me tengo que preocupar de a que usuario estoy modificando

    try {
        const usuario = await Usuario.findByPk(id);//mediante sequelize buscamos en la basd de datos el usuario con este id
        usuario.nombre = nombre;

        // Solo actualizamos el password si el usuario escribió algo
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);//encriptamos la contraseña para que a la hora de hacer login funcione correctamente
        }

        await usuario.save();//lo guardamos con los nuevos valores

        // IMPORTANTE: Actualizamos la sesión para que el Header cambie el nombre al instante
        req.session.usuario.nombre = nombre;//una vez cambiado el nombre se actualiza el nombre de la sesion

        res.redirect('/perfil?msg=actualizado');
    } catch (error) {
        console.log(error);
        res.redirect('/perfil');
    }
};

// 3. Eliminar cuenta
const eliminarCuenta = async (req, res) => {
    const { id } = req.session.usuario;

    try {
        await Usuario.destroy({ where: { id } });

        // Destruimos la sesión después de borrar de la base de datos
        req.session.destroy(() => {
            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
        res.redirect('/perfil');
    }
};
const historia = async (req, res) => {
    res.render('historia')
}
const resenias = async (req, res) => {
    try {
        const totaljoyas = await Joya.findAll({
            attributes: ['id_joya', 'nombre'] // trae solo estos campos
        });

        res.render('resenias', {
            pagina: 'Resenias',
            totaljoyas,
        })
    }
    catch (error) {
        console.error(error);
    }
}
// Crear un comentario
const crearComentario = async (req, res) => {
    const { id_joya, autor, contenido } = req.body;

    try {
        // Crear comentario
        await Comentario.create({
            id_joya,
            autor,
            contenido
        });

        // Buscar el slug de la joya para redirigir
        const joya = await Joya.findByPk(id_joya);
        if (!joya) return res.status(404).send('Joya no encontrada')
        else {
            return res.status(404).send('Mensaje creado');
        }

        res.redirect(`resenias`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar el comentario');
    }
};

// Página de prueba (si se necesita)
const paginaprueba = async (req, res) => {
    res.render('joyai', {
        pagina: 'Joyai Prueba',
        resultado: {},       // evita undefined en la vista
        comentarios: []      // array vacío para evitar errores
    });
};

export {
    paginaInicio,
    paginajoyas,
    informacionJoyas,
    crearComentario,
    paginaprueba,
    resenias,
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
    finalizarCompra
};
