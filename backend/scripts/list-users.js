const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/userModel');

async function listUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english_poc');
        console.log('Connected to MongoDB\n');

        // Get all users
        const users = await User.find({}, 'username role createdAt').sort({ createdAt: -1 });
        
        if (users.length === 0) {
            console.log('❌ No users found in the database');
        } else {
            console.log('👥 Users in database:\n');
            console.log('Username          | Role      | Created | pwd');
            console.log('-'.repeat(60));
            users.forEach(u => {
                const date = new Date(u.createdAt).toLocaleDateString();
                console.log(`${u.username.padEnd(17)} | ${u.role.padEnd(9)} | ${date} | ${u.pwd}`);
            });
            console.log(`\nTotal: ${users.length} user(s)`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

listUsers();
