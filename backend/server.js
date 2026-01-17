const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');

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

// Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { name, level } = req.body;
        const student = await Student.create({ name, level });
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Assignment Templates
app.get('/api/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/assignments', async (req, res) => {
    try {
        const { title, description, type } = req.body;
        const assignment = await Assignment.create({
            title,
            description,
            type: type || 'essay'
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Student Assignments (Linking)
app.get('/api/student-assignments', async (req, res) => {
    try {
        // Populate simply to verify integrity if needed, but the frontend does mostly client-side joining.
        // Ideally we should populate here, but to keep consistent with previous logic we return IDs.
        const links = await StudentAssignment.find().sort({ assignedAt: -1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/student-assignments', async (req, res) => {
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

app.patch('/api/student-assignments/:id', async (req, res) => {
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

// Grammar Routes
const fs = require('fs');
const path = require('path');

app.get('/api/grammar', (req, res) => {
    const grammarDir = path.join(__dirname, './grammar');

    if (!fs.existsSync(grammarDir)) {
        return res.json([]);
    }

    fs.readdir(grammarDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Unable to scan directory' });
        }
        // Filter only markdown files if needed, or send all
        const grammarFiles = files
            .filter(file => file.endsWith('.md'))
            .map(file => ({
                name: file,
                path: `/api/grammar/${file}`
            }));
        res.json(grammarFiles);
    });
});

app.get('/api/grammar/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, './grammar', filename);

    // Security check to prevent directory traversal
    if (filename.includes('..') || !filename.endsWith('.md')) {
        return res.status(400).json({ message: 'Invalid file request' });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json({ content: data });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
