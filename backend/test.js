// backend/test-db.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const path = require('path');

// Import your Product model
const Product = require('./src/models/Product');

// Database connection function (same as app.js)
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return true;
    }

    // Check if connecting
    if (mongoose.connection.readyState === 2) {
      console.log('⏳ MongoDB connection in progress...');
      return true;
    }

    console.log('🔗 Attempting to connect to MongoDB...');
    
    // Use same connection logic as app.js
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tantikaDB';
    console.log(`📊 URI: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('\nPlease check:');
    console.log('1. MongoDB is running (mongod)');
    console.log('2. MONGODB_URI in .env is correct');
    console.log('3. Network connectivity');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

// Main test function
const testDatabase = async () => {
  console.log('🚀 Starting database test...\n');
  
  // Connect to database
  const connected = await connectDB();
  
  if (!connected) {
    console.log('\n❌ Test failed: Could not connect to database');
    process.exit(1);
  }

  try {
    // ============================================
    // Test 1: Check connection state
    // ============================================
    console.log('\n📡 TEST 1: Connection State');
    console.log('='.repeat(50));
    
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    console.log(`Connection state: ${readyStates[mongoose.connection.readyState]} (${mongoose.connection.readyState})`);
    console.log(`Database host: ${mongoose.connection.host || 'N/A'}`);
    console.log(`Database name: ${mongoose.connection.name || 'N/A'}`);

    // ============================================
    // Test 2: Product counts
    // ============================================
    console.log('\n📊 TEST 2: Product Counts');
    console.log('='.repeat(50));
    
    const totalProducts = await Product.countDocuments({});
    console.log(`📦 Total products in database: ${totalProducts}`);

    // Count by status
    const statusCounts = await Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📌 Products by status:');
    if (statusCounts.length === 0) {
      console.log('  No products found');
    } else {
      statusCounts.forEach(s => {
        console.log(`  • ${s._id || 'null'}: ${s.count}`);
      });
    }

    // Count by approval status
    const approvalCounts = await Product.aggregate([
      { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📌 Products by approval status:');
    if (approvalCounts.length === 0) {
      console.log('  No products found');
    } else {
      approvalCounts.forEach(a => {
        console.log(`  • ${a._id || 'null'}: ${a.count}`);
      });
    }

    // ============================================
    // Test 3: Sample products
    // ============================================
    console.log('\n📋 TEST 3: Sample Products');
    console.log('='.repeat(50));
    
    const sampleProducts = await Product.find({})
      .select('name status approvalStatus category price stock')
      .limit(5)
      .lean();
    
    if (sampleProducts.length === 0) {
      console.log('No products found in database');
    } else {
      sampleProducts.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Status: ${p.status || 'null'}`);
        console.log(`   Approval: ${p.approvalStatus || 'null'}`);
        console.log(`   Category: ${p.category}`);
        console.log(`   Price: ₹${p.price}`);
        console.log(`   Stock: ${p.stock}`);
      });
    }

    // ============================================
    // Test 4: Check for specific product
    // ============================================
    console.log('\n🎯 TEST 4: Check Specific Product');
    console.log('='.repeat(50));
    
    const targetId = "69a1d7456b8209171255fab2";
    const targetName = "testing";
    
    // Search by ID
    const productById = await Product.findById(targetId).lean();
    if (productById) {
      console.log('✅ Found by ID:');
      console.log(`   Name: ${productById.name}`);
      console.log(`   Status: ${productById.status}`);
      console.log(`   Approval: ${productById.approvalStatus}`);
    } else {
      console.log(`❌ Product not found with ID: ${targetId}`);
    }
    
    // Search by name
    const productByName = await Product.findOne({ name: targetName }).lean();
    if (productByName) {
      console.log(`\n✅ Found by name "${targetName}":`);
      console.log(`   ID: ${productByName._id}`);
      console.log(`   Status: ${productByName.status}`);
      console.log(`   Approval: ${productByName.approvalStatus}`);
    } else {
      console.log(`\n❌ Product not found with name: ${targetName}`);
    }

    // ============================================
    // Test 5: Role-based query simulation
    // ============================================
    console.log('\n👑 TEST 5: Role-Based Queries');
    console.log('='.repeat(50));
    
    // Admin query (no filters)
    const adminCount = await Product.countDocuments({});
    console.log(`👑 Admin (no filters): ${adminCount} products`);
    
    // Public query (only active and approved)
    const publicCount = await Product.countDocuments({
      status: 'active',
      approvalStatus: 'approved'
    });
    console.log(`👤 Public (active + approved): ${publicCount} products`);
    
    // Artisan query (if we have an artisan)
    if (sampleProducts.length > 0 && sampleProducts[0].artisan) {
      const artisanId = sampleProducts[0].artisan;
      const artisanCount = await Product.countDocuments({ artisan: artisanId });
      console.log(`👨‍🎨 Artisan (${artisanId}): ${artisanCount} products`);
    }

    // ============================================
    // Summary
    // ============================================
    console.log('\n📋 ===== TEST SUMMARY =====');
    console.log('='.repeat(50));
    console.log(`✅ Database Connection: ${readyStates[mongoose.connection.readyState]}`);
    console.log(`✅ Total Products: ${totalProducts}`);
    console.log(`✅ Admin Sees: ${adminCount}`);
    console.log(`✅ Public Sees: ${publicCount}`);
    
    if (totalProducts !== adminCount) {
      console.log('\n⚠️ DISCREPANCY FOUND!');
      console.log(`   Database has ${totalProducts} but admin query returns ${adminCount}`);
      
      // Check for products with null/invalid status
      const invalidProducts = await Product.find({
        $or: [
          { status: null },
          { status: { $exists: false } },
          { approvalStatus: null },
          { approvalStatus: { $exists: false } }
        ]
      });
      
      if (invalidProducts.length > 0) {
        console.log(`\n❓ Products with invalid status: ${invalidProducts.length}`);
        invalidProducts.forEach(p => {
          console.log(`   • ${p.name}: status=${p.status}, approval=${p.approvalStatus}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Add connection event listeners (same as app.js)
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from DB');
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️ Test interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the test
testDatabase();