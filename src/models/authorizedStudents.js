// models/authorizedStudent.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuthorizedStudent = sequelize.define(
    'AuthorizedStudent', {
  id: {
     type: DataTypes.INTEGER, 
     primaryKey: true, 
     autoIncrement: true 
    },
  matricNumber: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
},
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
},
  fullName: {
     type: DataTypes.STRING, 
     allowNull: false 
    },
  department: { 
    type: DataTypes.STRING 
},
}, {
  tableName: 'authorized_students',
  underscored: true
});

export default AuthorizedStudent;