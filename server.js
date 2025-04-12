// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ITDepartmentDB')
  .then(() => {
    console.log('MongoDB connected');
    // Seed the database with initial data
    initializeDatabase();
  })
  .catch(err => console.log('MongoDB connection error:', err));

// Student Schema & Model
const Student = mongoose.model('Student', {
  name: String,
  age: Number,
  grade: String
});

// Function to initialize the database with sample data
async function initializeDatabase() {
  // Check if the database is empty
  const count = await Student.countDocuments();
  
  if (count === 0) {
    // Add sample data if the database is empty
    const sampleStudents = [
      { name: "John Doe", age: 19, grade: "A" },
      { name: "Jane Smith", age: 20, grade: "A-" },
      { name: "Michael Johnson", age: 18, grade: "B+" },
      { name: "Emily Davis", age: 21, grade: "A+" },
      { name: "Robert Wilson", age: 19, grade: "B" }
    ];
    
    try {
      await Student.insertMany(sampleStudents);
      console.log('Database initialized with sample data');
    } catch (err) {
      console.error('Error initializing database:', err);
    }
  } else {
    console.log('Database already contains data, skipping initialization');
  }
}

// Routes - All student operations in a much more concise format
app
  // Get all students
  .get('/api/students', async (req, res) => {
    try {
      res.json(await Student.find());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  
  // Get student by ID
  .get('/api/students/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      student ? res.json(student) : res.status(404).json({ error: 'Student not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
  
  // Add new student
  .post('/api/students', async (req, res) => {
    try {
      const newStudent = await new Student(req.body).save();
      res.status(201).json(newStudent);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  })
  
  // Update student by ID
  .put('/api/students/:id', async (req, res) => {
    try {
      const student = await Student.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      );
      student ? res.json(student) : res.status(404).json({ error: 'Student not found' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  })
  
  // Delete student by ID
  .delete('/api/students/:id', async (req, res) => {
    try {
      const result = await Student.findByIdAndDelete(req.params.id);
      result ? res.json({ message: 'Student deleted' }) : res.status(404).json({ error: 'Student not found' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));