const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['essay', 'sentences', 'grammar'],
        default: 'essay'
    },
    grammarLessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GrammarLesson',
        default: null,
        sparse: true
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

module.exports = mongoose.model('Assignment', assignmentSchema);
