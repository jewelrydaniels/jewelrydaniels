import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const db = new Sequelize('dct_joyeria', 'alumno', 'Galeote12345$_', {
    host: '85.50.129.88',
    port: 3306,
    dialect: 'mysql',
    define: { timestamps: false },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});



export default db;