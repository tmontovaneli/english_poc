const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { requireAdmin, requireTeacherOrAdmin } = require('./middleware/roleMiddleware');
const { registerUser, loginUser, getMe } = require('./controllers/authController');
const { getAllUsers, createUser, updateUser, deleteUser } = require('./controllers/userController');
const { 
    getAllLessons, 
    getLessonById, 
    getLessonBySlug, 
    createLesson, 
    updateLesson, 
    deleteLesson 
} = require('./controllers/grammarController');

// Models
const Student = require('./models/studentModel');
const Assignment = require('./models/assignmentModel');
const StudentAssignment = require('./models/studentAssignmentModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'https://english-poc-fe-production.up.railway.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    }
}));
app.use(bodyParser.json());

// API Routes

// Auth Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/me', protect, getMe);

// User Management Routes (Admin/Teacher only)
app.get('/api/users', protect, requireTeacherOrAdmin, getAllUsers);
app.post('/api/users', protect, requireAdmin, createUser);
app.put('/api/users/:id', protect, requireAdmin, updateUser);
app.delete('/api/users/:id', protect, requireAdmin, deleteUser);

// Students
app.get('/api/students', protect, async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', protect, async (req, res) => {
    try {
        const { name, level } = req.body;
        const student = await Student.create({ name, level });
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Link/Unlink User to Student
app.patch('/api/students/:id/link-user', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // userId can be null to unlink

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.userId = userId || null;
        await student.save();

        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Assignment Templates
app.get('/api/assignments', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find().populate('grammarLessonId').sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/assignments', protect, async (req, res) => {
    try {
        const { title, description, type, grammarLessonId } = req.body;
        const assignment = await Assignment.create({
            title,
            description,
            type: type || 'essay',
            grammarLessonId: grammarLessonId || null
        });
        const populatedAssignment = await assignment.populate('grammarLessonId');
        res.status(201).json(populatedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/assignments/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, grammarLessonId } = req.body;
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (grammarLessonId !== undefined) updateData.grammarLessonId = grammarLessonId || null;

        const assignment = await Assignment.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('grammarLessonId');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Student Assignments (Linking)
app.get('/api/student-assignments', protect, async (req, res) => {
    try {
        // Populate simply to verify integrity if needed, but the frontend does mostly client-side joining.
        // Ideally we should populate here, but to keep consistent with previous logic we return IDs.
        const links = await StudentAssignment.find().sort({ assignedAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/student-assignments', protect, async (req, res) => {
    try {
        const { studentId, assignmentId, dueDate } = req.body;
        const link = await StudentAssignment.create({
            studentId,
            assignmentId,
            dueDate
        });
        res.status(201).json(link);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.patch('/api/student-assignments/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, submissionContent, teacherFeedback, grade } = req.body;

        // Construct update object dynamically to only update provided fields
        const updateData = {};
        if (status) updateData.status = status;
        if (submissionContent) {
            updateData.submissionContent = submissionContent;
            updateData.submittedAt = new Date(); // Auto-set timestamp on submission
        }
        if (teacherFeedback) updateData.teacherFeedback = teacherFeedback;
        if (grade) updateData.grade = grade;

        const link = await StudentAssignment.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return updated document
        );

        if (!link) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(link);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/student-assignments/:id', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const link = await StudentAssignment.findByIdAndDelete(id);

        if (!link) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Grammar Routes (Database)
app.get('/api/grammar', protect, getAllLessons);
app.get('/api/grammar/:id', protect, getLessonById);
app.get('/api/grammar/slug/:slug', protect, getLessonBySlug);
app.post('/api/grammar', protect, requireAdmin, createLesson);
app.put('/api/grammar/:id', protect, requireAdmin, updateLesson);
app.delete('/api/grammar/:id', protect, requireAdmin, deleteLesson);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
