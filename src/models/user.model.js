// src/models/users.model.js
import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,           
      validate: { isEmail: true },
    },

    matricNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,         
    },

    role: {
      type: DataTypes.ENUM("student", "classRep"),
      allowNull: false,
      defaultValue: "student",
    },

    passwordHash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: true,
  }
);

export default User;