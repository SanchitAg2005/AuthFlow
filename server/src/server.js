// Catch uncaught synchronous exceptions to prevent leaky crashes
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down server safely...');
  console.error(err.name, err.message);
  process.exit(1);
});

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect Mongoose Database
connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[Server] AuthFlow running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[API Docs] Interactive Swagger UI active at http://localhost:${PORT}/api-docs`);
});

// Catch asynchronous unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down server safely...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
