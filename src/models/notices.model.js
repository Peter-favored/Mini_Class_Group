// src/models/notice.model.js
import { DataTypes } from 'sequelize';
import sequelize from "../config/database.js";

const Notice = sequelize.define(
  'Notice', {
  id:{
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
  date:{
     type: DataTypes.DATE, 
     allowNull: false
     }, 
  classRepId: 
  { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  tableName: 'notices',
  indexes: [{ fields: ['date'] }]
});

export default Notice;