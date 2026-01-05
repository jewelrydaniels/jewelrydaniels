import sequelize from 'sequelize';
import db from '../config/db.js';
import Sequelize from "sequelize";

export const Joya = db.define('joyas', {
    id_joya: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: Sequelize.STRING,
    },
    tipo: {
        type: Sequelize.STRING,
    },
    material: {
        type: Sequelize.STRING,
    },
    precio: {
        type: Sequelize.DECIMAL(10, 2),
    },
    stock: {
        type: Sequelize.INTEGER,
    },
    imagen: {
        type: Sequelize.STRING, // nombre o ruta de la imagen
    },
    slug: {
        type: Sequelize.STRING, // nombre o ruta de la imagen
    },
    tiendas: {
        type: Sequelize.STRING, // nombre o ruta de la imagen
    }
},{
    tableName: 'joyas',
    timestamps: false
});

export default Joya;
