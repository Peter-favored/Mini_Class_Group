// src/models/submission.models.js
import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Submission = sequelize.define(
  "Submission",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    filePath: { type: DataTypes.STRING, allowNull: false },
    note: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" }, 
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "assignments", key: "id" }, // table is `assignments` (lowercase) per log
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "submissions",   // aligns with creation in your logs
    indexes: [
      {
        name: "submissions_assignmentId_studentId",
        unique: true,
        fields: ["assignmentId", "studentId"], // ✅ camelCase to match columns
      },
    ],
    timestamps: true,
  }
);

export default Submission;