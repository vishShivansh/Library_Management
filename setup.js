#!/usr/bin/env node

/**
 * Setup script for Library Management System
 * Creates initial admin user if it doesn't exist
 */

require('dotenv').config();
const { sequelize, Admin } = require('./models');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ where: { email: 'admin@library.com' } });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists.');
      process.exit(0);
    }

    // Create default admin
    const admin = await Admin.create({
      name: 'Library Administrator',
      email: 'admin@library.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
      role: 'admin',
    });

    console.log('✅ Default admin created:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'}`);
    console.log('⚠️  Please change the default password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
};

createAdmin();






