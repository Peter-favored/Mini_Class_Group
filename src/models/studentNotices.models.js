// src/models/studentNotices.model.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const StudentNotice = sequelize.define(
  "StudentNotice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    noticeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["studentId", "noticeId"],
      },
    ],
  }
);

export default StudentNotice;