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

// Middleware
app.use(
    cors({
        origin: "https://english-poc-fe-production.up.railway.app",
        credentials: true,
        methods: ["POST", "GET", "PUT", "DELETE"],
    })
);
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
        const { status } = req.body;

        const link = await StudentAssignment.findByIdAndUpdate(
            id,
            { status },
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
