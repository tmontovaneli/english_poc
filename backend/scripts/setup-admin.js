const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/userModel');

async function setupAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english_poc');
        console.log('Connected to MongoDB');

        // Check for existing admin users
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log(`✅ Admin user already exists: ${existingAdmin.username}`);
            await mongoose.disconnect();
            return;
        }

        // Check if a user was provided as an argument
        const username = process.argv[2];
        if (!username) {
            console.log('❌ Please provide a username as argument');
            console.log('Usage: node setup-admin.js <username>');
            console.log('Example: node setup-admin.js admin');
            await mongoose.disconnect();
            return;
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`❌ User '${username}' not found`);
            console.log('\n📋 Available users:');
            const allUsers = await User.find({}, 'username role');
            allUsers.forEach(u => console.log(`  - ${u.username} (${u.role})`));
            await mongoose.disconnect();
            return;
        }

        // Update user role to admin
        user.role = 'admin';
        await user.save();
        console.log(`✅ User '${username}' has been set to admin role`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupAdmin();
