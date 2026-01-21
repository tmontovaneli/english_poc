const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/userModel');

async function resetPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english_poc');
        console.log('Connected to MongoDB\n');

        const username = process.argv[2];
        const newPassword = process.argv[3];

        if (!username || !newPassword) {
            console.log('❌ Please provide both username and new password');
            console.log('Usage: node reset-password.js <username> <new_password>');
            console.log('Example: node reset-password.js Thiago myNewPassword123');
            await mongoose.disconnect();
            return;
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`❌ User '${username}' not found`);
            await mongoose.disconnect();
            return;
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        console.log(`✅ Password for '${username}' has been reset`);
        console.log(`   New password: ${newPassword}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
