const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const GrammarLesson = require('../models/grammarLessonModel');
const connectDB = require('../config/db');

const grammarDir = path.join(__dirname, '../grammar');

async function migrateGrammarLessons() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Read all markdown files from the grammar directory
        const files = fs.readdirSync(grammarDir)
            .filter(file => file.endsWith('.md'))
            .sort();

        console.log(`Found ${files.length} grammar files to migrate`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(grammarDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            // Extract title from filename (remove order number and extension)
            const titleMatch = file.match(/^\d+_(.+)\.md$/);
            const slug = titleMatch ? titleMatch[1] : file.replace('.md', '');
            
            // Extract title from first heading in markdown
            const headingMatch = content.match(/^#\s+(.+)$/m);
            const title = headingMatch ? headingMatch[1] : slug.replace(/_/g, ' ');

            // Check if lesson already exists
            const existing = await GrammarLesson.findOne({ slug });
            
            if (existing) {
                console.log(`Updating: ${title}`);
                await GrammarLesson.findByIdAndUpdate(existing._id, {
                    title,
                    order: i + 1,
                    content,
                    slug
                });
            } else {
                console.log(`Creating: ${title}`);
                await GrammarLesson.create({
                    title,
                    order: i + 1,
                    content,
                    slug
                });
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrateGrammarLessons();
