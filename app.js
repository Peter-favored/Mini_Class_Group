import dotenv from "dotenv";        
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { specs } from './src/config/swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import errorHandler from './src/middleware/errorHandler.js';
import sequelize from './src/config/database.js';

//Models & Associations
import './src/models/user.model.js';
import './src/models/timetable.models.js';
import './src/models/assignments.models.js';
import './src/models/submission.models.js';
import './src/models/notices.model.js';
import './src/models/studentNotices.models.js';
import './src/association.js';

// Create Express app
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//security headers
app.use(helmet());

//cors configuration
app.use(
  cors({
    origin: true, // allow all origins for now; restrict in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

//cookies and body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//request logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

//serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//Health check route
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

//swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

//routes
import routes from './src/routes/index.js';
app.use('/api', routes);


// 404 Handler
app.use((req, res, _next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling
app.use(errorHandler);

// start server
const PORT = Number(process.env.PORT || 4000);
let server;

(async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connected');
    
    //Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Could not start server:', err?.message || err);
    process.exit(1);
  }
})();

export default app;