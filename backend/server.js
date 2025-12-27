// Load environment variables FIRST
require('dotenv').config({ path: '.env' });

// Import app AFTER dotenv
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\nতন্তিকা Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
    
    // Log database connection status
    const mongoose = require('mongoose');
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`📡 Database Status: ${readyStates[mongoose.connection.readyState]}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    // Close server & exit process
    server.close(() => {
      console.log('Server closed due to unhandled rejection');
      process.exit(1);
    });
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;