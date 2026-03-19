// src/models/assignment.model.js
import { DataTypes } from 'sequelize';
import sequelize from "../config/database.js";

const Assignment = sequelize.define(
  'Assignment', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true
   },
  title:{ 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description:{ 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  deadline:{
     type: DataTypes.DATE, 
     allowNull: false
     },
  createdById:{
     type: DataTypes.INTEGER, 
     allowNull: true 
    }
}, {
  tableName: 'assignments',
  indexes: [{ fields: ['deadline'] }]
});

export default Assignment;