require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the model we just created
const Resource = require('./models/Resource');

const app = express();

// Middleware
app.use(cors()); // Allows React to talk to this server
app.use(express.json()); // Allows server to read JSON data


// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Locally'))
  .catch(err => console.error('MongoDB Connection Error:', err));


// API Routes
// 1. GET ALL RESOURCES (Supports User Story U-01: Filtering)
// Usage: /api/resources?category=Anxiety&urgency=High
app.get('/api/resources', async (req, res) => {
  try {
    const { category, urgency, location } = req.query;
    let filter = {};

    // If query params exist, add them to the filter object
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (location) filter.location = location;

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD NEW RESOURCE (Supports User Story U-04: Admin Add)
app.post('/api/resources', async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. ADMIN LOGIN (Supports User Story U-03: Admin Login)
// Note: For Sprint 2 Screenshots, we are using a simple hardcoded check.
// In Sprint 3, we can connect this to a real Users collection with hashing.
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Simple check for the demo
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));