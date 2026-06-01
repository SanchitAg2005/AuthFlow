require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Set Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    console.log(`[Seeding] Checking for existing administrator: ${adminEmail}...`);

    // 3. Prevent duplicate creation
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`[Seeding] Administrator already exists. Seed process skipped.`);
      process.exit(0);
    }

    // 4. Create Admin record (Bcrypt hash hook will trigger on userSchema.pre('save'))
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log(`[Seeding Success] Administrator account successfully created!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seeding Error] Seeding process failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
