require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Resource = require('./models/Resource');

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Locally'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API Routes ---


// 1. GET Resources (Filter + Smart Search) - Covers U-01
app.get('/api/resources', async (req, res) => {
  try {
    const { category, urgency, search } = req.query;
    let filter = {};

    // Standard Filters
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    
    // "Smart" AI Logic (U-07)
    if (search) {
      const term = search.toLowerCase();

      // 1. Check for specific Keywords (The "AI" part)
      if (term.includes('anxi') || term.includes('worr') || term.includes('panic')) {
        filter.category = 'Anxiety';
      } 
      else if (term.includes('depress') || term.includes('sad') || term.includes('hopeless')) {
        filter.category = 'Depression';
      }
      else if (term.includes('stress') || term.includes('overwhelm') || term.includes('burnout')) {
        filter.category = 'Stress';
      }
      else if (term.includes('crisis') || term.includes('suicid') || term.includes('emergency') || term.includes('kill')) {
        filter.category = 'Crisis';
      }
      // 2. If no keywords match, do a broad text search
      else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD Resource - Covers U-04
app.post('/api/resources', async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. EDIT Resource - Covers U-05
app.put('/api/resources/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Return the updated version
    );
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE Resource - Covers U-06
app.delete('/api/resources/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. ADMIN LOGIN - Covers U-03
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));