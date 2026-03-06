import { Cliente } from "../models/Cliente.js";
import { Empleado } from "../models/Empleado.js";
import { Joya } from "../models/Joya.js";
import { Comentario } from "../models/Comentario.js";
import { Admin } from "../models/admin.js";
import {Usuario} from "../models/Usuario.js";
import {Compra} from "../models/Compra.js";
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { Op } from 'sequelize';
import nodemailer from 'nodemailer';/*actualmente descartado por render*/

const resend = new Resend(process.env.RESEND_API_KEY);
const protegerRuta = (req, res, next) => {
    if (req.session.usuario) {
        return next(); // si hay session activa, el return next deja de ejecutar codigo de la funcion para dar paso a la pagina
    }
    res.redirect('/login');
};

const mostrarLogin = (req, res) => {
    res.render('login', {
        pagina: 'Iniciar Sesión'
    });
};

const mostrarRegistro = (req, res) => {
    res.render('registro', {
        pagina: 'Crear Cuenta'
    });
};

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
};
/*he utilizado resend debido a que render tiene los puertos SMTP bloqueados aunque con resend solo me deja enviar email al correo que tengo puesta
* en esa cuenta :( */
const finalizarCompra = async (req, res) => {
    const { carrito, usuario } = req.session;

    if (!usuario) return res.redirect('/login');
    if (!carrito || carrito.length === 0) return res.redirect('/joyas');

    try {
        let productosHtml = "";
        let totalCompra = 0;
        const fechaActual = new Date();
        for (const item of carrito) {/*recorro el array del carrito para luego poder verlo desde el perfil con la tabla 'compras' */
            const subtotal = item.precio * item.cantidad;
            totalCompra += subtotal;
            await Compra.create({
                nombre_joya: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                fecha: fechaActual,
                email_cliente: usuario.email,
                nombre_cliente: usuario.nombre
            });
            productosHtml += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.nombre}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.precio}€</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${subtotal.toFixed(2)}€</td>
                </tr>
            `;
        }
        await resend.emails.send({
            from: "Daniel's Jewelry <onboarding@resend.dev>",
            to: usuario.email,
            subject: "Confirmación de tu pedido en Daniel's Jewelry",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #d4af37; text-align: center;">¡Gracias por tu compra, ${usuario.nombre}!</h2>
                    <p>Tu pedido ha sido registrado y procesado correctamente.</p>
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
                </div>
            `
        });

        console.log("Compra guardada en BD y Email enviado con éxito");

        // Limpiamos carrito y renderizamos confirmación
        req.session.carrito = [];
        res.render('confirmacion', {
            pagina: '¡Gracias por tu compra!',
            usuario
        });

    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.redirect('/carrito');
    }
};
const eliminarDelCarrito = (req, res) => {
    const { id_joya } = req.body;

    if (req.session.carrito) {
        req.session.carrito = req.session.carrito.filter(item => item.id != id_joya);
    }

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
        res.redirect('/');
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
    const { term } = req.query;
    try {
        let joyas;
        if (term && term.trim() !== "") {
            joyas = await Joya.findAll({
                where: {
                    nombre: {
                        [Op.like]: `%${term}%`
                    }
                }
            });
        } else {
            joyas = await Joya.findAll();
        }
        res.render('joyas', {
            joya: joyas,
            term /* es el valor de la query, lo usamos para  poner el boton de quitar filtro*/
        });

    } catch (err) {
        console.error(err);
    }
};
const cargarTodaslasJoyas = async(req,res) => {


}
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
            comentarios: resultado.comentarios // array vacío si no hay comentarios
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

    const { email } = req.session.usuario;

    try {
        const compras = await Compra.findAll({
            where: { email_cliente: email },
            order: [['fecha', 'DESC']]
        });

        res.render('perfil', {
            pagina: 'Mi Perfil',
            msg,
            compras
        });

    } catch (error) {
        console.error("Error al obtener el historial:", error);
        res.render('perfil', {
            pagina: 'Mi Perfil',
            msg,
            compras: []
        });
    }
};
const actualizarPerfil = async (req, res) => {
    const { nombre, password } = req.body;
    const { id } = req.session.usuario;

    try {
        const usuario = await Usuario.findByPk(id);//mediante sequelize buscamos en la basd de datos el usuario con este id
        usuario.nombre = nombre;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);//encriptamos la contraseña para que a la hora de hacer login funcione correctamente
        }

        await usuario.save();//lo guardamos con los nuevos valores
        req.session.usuario.nombre = nombre;

        res.redirect('/perfil?msg=actualizado');/* para mostrar el contenedor de actualizado*/
    } catch (error) {
        console.log(error);
        res.redirect('/perfil');
    }
};
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
/*uso el mismo que en el proyecto anterior pero con la diferencia de que el autor me lo coge el pug de la session y no del formulario*/
const crearComentario = async (req, res) => {
    const { id_joya, autor, contenido } = req.body;

    try {
        await Comentario.create({
            id_joya,
            autor,
            contenido
        });
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

/*pagina del anterior proyecto de node*/
const paginaprueba = async (req, res) => {
    res.render('joyai', {
        pagina: 'Joyai Prueba',
        resultado: {},
        comentarios: []
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
    finalizarCompra,
    mostrarLogin,
    mostrarRegistro
};
