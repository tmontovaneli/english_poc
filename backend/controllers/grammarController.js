const GrammarLesson = require('../models/grammarLessonModel');

// Get all grammar lessons
exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await GrammarLesson.find().sort({ order: 1 });
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific grammar lesson by ID
exports.getLessonById = async (req, res) => {
    try {
        const lesson = await GrammarLesson.findById(req.params.id);
        
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a grammar lesson by slug
exports.getLessonBySlug = async (req, res) => {
    try {
        const lesson = await GrammarLesson.findOne({ slug: req.params.slug });
        
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        
        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new grammar lesson (admin only)
exports.createLesson = async (req, res) => {
    try {
        const { title, content, slug, order } = req.body;

        if (!title || !content || !slug) {
            return res.status(400).json({ 
                message: 'Title, content, and slug are required' 
            });
        }

        // Check if slug already exists
        const existingLesson = await GrammarLesson.findOne({ slug });
        if (existingLesson) {
            return res.status(409).json({ 
                message: 'A lesson with this slug already exists' 
            });
        }

        // If order is not provided, assign the next available order
        let lessonOrder = order;
        if (!lessonOrder) {
            const lastLesson = await GrammarLesson.findOne().sort({ order: -1 });
            lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
        }

        const lesson = await GrammarLesson.create({
            title,
            content,
            slug,
            order: lessonOrder
        });

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a grammar lesson (admin only)
exports.updateLesson = async (req, res) => {
    try {
        const { title, content, slug, order } = req.body;
        
        // Check if new slug already exists (if slug is being changed)
        if (slug && slug !== (await GrammarLesson.findById(req.params.id)).slug) {
            const existingLesson = await GrammarLesson.findOne({ slug });
            if (existingLesson) {
                return res.status(409).json({ 
                    message: 'A lesson with this slug already exists' 
                });
            }
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (slug) updateData.slug = slug;
        if (order !== undefined) updateData.order = order;

        const lesson = await GrammarLesson.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a grammar lesson (admin only)
exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await GrammarLesson.findByIdAndDelete(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
