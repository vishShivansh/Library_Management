const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const config = require('./config/config');
const { connectMongoDB } = require('./config/mongodb');
const { syncAllToMongoDB } = require('./utils/mongoSync.service');

// Import routes
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const borrowRoutes = require('./routes/borrow.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const feeRoutes = require('./routes/fee.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const mongoRoutes = require('./routes/mongo.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development (change in production)
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notify', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mongo', mongoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    const dbConfig = require('./config/database')[config.env];
    console.log(`🔌 Attempting to connect to MySQL at ${dbConfig.host}:${dbConfig.port}...`);
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized.');
    }

    // Connect to MongoDB (optional)
    const mongoConnection = await connectMongoDB();
    if (mongoConnection) {
      // Sync data from MySQL to MongoDB for viewing
      console.log('🔄 Syncing data to MongoDB...');
      await syncAllToMongoDB();
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Accessible at: http://localhost:${config.port} and http://YOUR_IP:${config.port}`);
      if (mongoConnection) {
        console.log(`📊 MongoDB available for data viewing at: ${config.mongodb.url}`);
      }
    });
  } catch (error) {
    console.error('\n❌ Unable to start server: Database connection failed\n');
    
    if (error.name === 'SequelizeConnectionRefusedError' || error.code === 'ECONNREFUSED') {
      console.error('📋 Troubleshooting Steps:');
      console.error('   1. Check if MySQL is installed and running');
      console.error('   2. Start MySQL service:');
      console.error('      - Windows: Open Services (services.msc) → Find MySQL → Start');
      console.error('      - Or run: net start MySQL80 (as Administrator)');
      console.error('      - XAMPP: Open XAMPP Control Panel → Start MySQL');
      console.error('   3. Verify MySQL is listening on port 3306');
      console.error('   4. Check your .env file database credentials:');
      const dbConfig = require('./config/database')[config.env];
      console.error(`      Host: ${dbConfig.host}`);
      console.error(`      Port: ${dbConfig.port}`);
      console.error(`      Database: ${dbConfig.database}`);
      console.error(`      User: ${dbConfig.username}`);
      console.error('   5. Create the database if it doesn\'t exist:');
      console.error(`      mysql -u ${dbConfig.username} -p -e "CREATE DATABASE IF NOT EXISTS ${dbConfig.database};"`);
      console.error('\n💡 For detailed setup instructions, see: backend/README.md or QUICK_START.md\n');
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('📋 Authentication failed. Check your database credentials in .env:');
      console.error('   - DB_USER');
      console.error('   - DB_PASSWORD');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('📋 Database error. Make sure the database exists:');
      const dbConfig = require('./config/database')[config.env];
      console.error(`   Run: CREATE DATABASE ${dbConfig.database};`);
    } else {
      console.error('Error details:', error.message);
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

startServer();
