const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const apiRouter = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./middleware/logger.middleware');
const AppError = require('./errors/AppError');

const app = express();

// Global Security & Request Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

// Swagger OpenAPI 3.0 configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuthFlow API - Internship Assignment',
      version: '1.0.0',
      description: 'Production-ready REST API with robust JWT Authentication, Role-Based Access Control, and Task CRUD management.'
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Automated decorator scraping
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Router Mount
app.use('/api/v1', apiRouter);

// Operational Unhandled Route Guard
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Cannot find route path ${req.originalUrl} on this server`, 404, 'ROUTE_NOT_FOUND'));
});

// Central Exception Interceptor
app.use(errorHandler);

module.exports = app;
