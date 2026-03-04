import sequelize from 'sequelize';
import db from '../config/db.js';
import Sequelize from "sequelize";

export const Admin = db.define('admin', {
    nombre: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    clave: {
        type: Sequelize.STRING, // nombre o ruta de la imagen
    }
},{
    tableName: 'admin',
    timestamps: false
});

export default Admin;
