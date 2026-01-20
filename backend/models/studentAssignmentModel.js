const mongoose = require('mongoose');

const studentAssignmentSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'submitted', 'completed'],
        default: 'pending'
    },
    dueDate: {
        type: Date
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    submissionContent: {
        type: String
    },
    teacherFeedback: {
        type: String
    },
    grade: {
        type: String
    },
    submittedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('StudentAssignment', studentAssignmentSchema);
