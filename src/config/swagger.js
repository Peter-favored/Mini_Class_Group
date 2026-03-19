// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from "dotenv";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Class Group API",
      version: "1.0.0",
      description: "API documentation for the Class Group Project",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Local development server",
      },
    ],
  },

 apis: ['./src/routes/index.js'], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
