import { Cliente } from "../models/Cliente.js";
import { Empleado } from "../models/Empleado.js";
import { Joya } from "../models/Joya.js";
import { Comentario } from "../models/Comentario.js";

// Página de inicio
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

// Página de todas las joyas
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
            include: [{ model: Comentario, as: 'comentarios' }] // alias explícito
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
        if (!joya) return res.status(404).send('Joya no encontrada');

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
};
