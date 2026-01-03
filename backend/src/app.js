const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan'); // Add for logging

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const userNormRoutes = require('./routes/userNormRoutes');

const app = express();

// ========================
// CORS Configuration
// ========================

// Replace 'your-project-name' with your actual Vercel project name
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tantika.vercel.app', // Change 'your-project-name' to your actual project name
  'https://*.vercel.app', // Allow all Vercel previews
  // Add more if needed:
  // 'https://tantika-frontend.vercel.app',
  // 'http://localhost:5173', // Vite dev server
  // 'https://your-custom-domain.com'
];

console.log('🌐 Configured CORS Origins:', allowedOrigins);

// Enhanced CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('📨 Request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is allowed
    let isAllowed = false;
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      isAllowed = true;
    }
    
    // Check wildcard matches (for *.vercel.app)
    if (!isAllowed) {
      for (const allowedOrigin of allowedOrigins) {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            isAllowed = true;
            break;
          }
        }
      }
    }
    
    if (isAllowed) {
      console.log(`✅ CORS allowed for: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options('*', cors(corsOptions));

// ========================
// Database Connection
// ========================
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Check if connecting
    if (mongoose.connection.readyState === 2) {
      console.log('⏳ MongoDB connection in progress...');
      return;
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/tantikaDB',
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('Please check:');
    console.log('1. MongoDB is running (mongod)');
    console.log('2. MONGODB_URI in .env is correct');
    console.log('3. Network connectivity');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Initialize DB connection
connectDB();

// ========================
// Middleware
// ========================

// HTTP request logging
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// ========================
// Routes
// ========================

// Welcome route with CORS info
app.get('/', (req, res) => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = readyStates[mongoose.connection.readyState] || 'unknown';
  
  const clientOrigin = req.headers.origin || 'No origin header';
  const clientIp = req.ip || req.connection.remoteAddress;
  
  console.log(`🌐 Client request from: ${clientOrigin} (IP: ${clientIp})`);
  
  res.json({ 
    message: 'Welcome to তন্তিকা Backend API',
    version: '1.0.0',
    status: 'running',
    cors: {
      allowedOrigins: allowedOrigins,
      clientOrigin: clientOrigin,
      credentials: true
    },
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    },
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      product_categories: '/api/products/categories',
      product_stats: '/api/products/stats/summary',
      upload: '/api/upload',
      health_check: '/health',
      cors_test: '/api/cors-test'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbStatus = readyStates[mongoose.connection.readyState] || 'unknown';
  
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    service: 'tantika-backend',
    status: 'running',
    cors: {
      allowedOrigins: allowedOrigins,
      clientOrigin: req.headers.origin || 'No origin',
      credentials: true
    },
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState
    },
    endpoints: {
      auth: 'active',
      products: 'active',
      orders: 'active',
      upload: 'active'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// CORS Test Route (for debugging)
app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin || 'No origin';
  
  res.json({
    success: true,
    message: 'CORS test successful!',
    timestamp: new Date().toISOString(),
    request: {
      origin: origin,
      method: req.method,
      headers: req.headers
    },
    cors: {
      allowedOrigins: allowedOrigins,
      isAllowed: allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return allowed === origin;
      }),
      credentials: true
    }
  });
});

// Test POST endpoint
app.post('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'POST request accepted',
    data: req.body || 'No data',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/usernorms', userNormRoutes);
// Add a test upload route
app.get('/api/upload/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload route is working',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin || 'No origin'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ 404: API endpoint not found: ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/products',
      '/api/orders',
      '/api/upload',
      '/api/cors-test',
      '/health'
    ],
    timestamp: new Date().toISOString()
  });
});

// General 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404: Route not found: ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    suggestion: 'Try visiting / for available endpoints',
    timestamp: new Date().toISOString()
  });
});

// ========================
// Database Connection Events
// ========================
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from DB');
});

// ========================
// Error Handling Middleware
// ========================
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      details: {
        yourOrigin: req.headers.origin || 'No origin header',
        allowedOrigins: allowedOrigins,
        timestamp: new Date().toISOString()
      },
      suggestion: 'Add your origin to the allowedOrigins array in app.js'
    });
  }
  
  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB'
    });
  }
  
  if (err.code === 'ENOENT') {
    return res.status(500).json({
      success: false,
      message: 'File system error'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    }),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;