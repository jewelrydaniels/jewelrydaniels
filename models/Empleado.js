import sequelize from 'sequelize';
import db from '../config/db.js';
import Sequelize from "sequelize";

export const Empleado = db.define('empleados', {
    id_empleado: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: Sequelize.STRING,
    },
    apellido: {
        type: Sequelize.STRING,
    },
    puesto: {
        type: Sequelize.STRING,
    },
    telefono: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    password_hash: {
        type: Sequelize.STRING,
    },
});