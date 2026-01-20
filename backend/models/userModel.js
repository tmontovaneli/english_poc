const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin', 'system'],
        default: 'student'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
