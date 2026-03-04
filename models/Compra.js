import { Sequelize } from "sequelize";
import db from "../config/db.js";

export const Compra = db.define('compras', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_joya: { type: Sequelize.STRING },
    precio: { type: Sequelize.DECIMAL(10, 2) },
    cantidad: { type: Sequelize.INTEGER },
    email_cliente: { type: Sequelize.STRING },
    nombre_cliente: { type: Sequelize.STRING },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false
});