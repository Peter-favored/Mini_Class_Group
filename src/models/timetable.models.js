// src/models/timetable.model.js
import { DataTypes } from 'sequelize';
import sequelize from "../config/database.js";

const Timetable = sequelize.define('Timetable', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  course: { 
    type: DataTypes.STRING, 
    allowNull: false },
  classBeginsAt: { 
    type: DataTypes.DATE, 
    allowNull: false },
  classEndsAt:   { 
    type: DataTypes.DATE, 
    allowNull: false },
  createdById:{
     type: DataTypes.INTEGER, 
     allowNull: true 
    }
}, {
  tableName: 'timetables'
});

export default Timetable;