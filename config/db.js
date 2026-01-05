import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const db = new Sequelize(process.env.CONEXION, {
});



export default db;