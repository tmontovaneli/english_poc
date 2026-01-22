const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('../models/assignmentModel');

async function linkGrammarAssignment() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/english_poc');
        console.log('Connected to MongoDB\n');

        // Find the "Present simple" assignment
        const assignment = await Assignment.findOne({ title: 'Present simple', type: 'grammar' });
        
        if (!assignment) {
            console.log('❌ Assignment "Present simple" not found');
            await mongoose.disconnect();
            return;
        }

        console.log(`📝 Found assignment: ${assignment.title}`);
        console.log(`   Current grammarLessonId: ${assignment.grammarLessonId}`);

        // The grammar lesson IDs - need to find the correct one
        // Let's fetch the Present Simple grammar lesson
        const GrammarLesson = require('../models/grammarLessonModel');
        const grammarLesson = await GrammarLesson.findOne({ title: 'Present Simple' });

        if (!grammarLesson) {
            console.log('❌ Grammar lesson "Present Simple" not found');
            await mongoose.disconnect();
            return;
        }

        console.log(`📚 Found grammar lesson: ${grammarLesson.title}`);
        console.log(`   ID: ${grammarLesson._id}`);

        // Update the assignment
        assignment.grammarLessonId = grammarLesson._id;
        await assignment.save();

        console.log(`✅ Assignment updated successfully!`);
        console.log(`   New grammarLessonId: ${assignment.grammarLessonId}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

linkGrammarAssignment();
