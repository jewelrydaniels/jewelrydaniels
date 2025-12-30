import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import { Joya } from './Joya.js';

export const Comentario = db.define('Comentario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    autor: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    id_joya: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Joya,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'comentarios',
    timestamps: true
});

// Relaciones
Joya.hasMany(Comentario, { foreignKey: 'id_joya', onDelete: 'CASCADE', as: 'comentarios' });
Comentario.belongsTo(Joya, { foreignKey: 'id_joya', onDelete: 'CASCADE', as: 'joya' });

export default Comentario;