require('dotenv').config();

// --- DEBUGGING START ---
console.log("------------------------------------------------");
console.log("DEBUG: Checking API Key...");
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is undefined. The .env file is not being read.");
} else {
  // Print first 5 chars to verify it's loaded, but don't leak the whole thing
  console.log("✅ SUCCESS: Key found. Starts with: " + process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}
console.log("------------------------------------------------");
// --- DEBUGGING END ---

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import AI

const Resource = require('./models/Resource');

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Use the fast, free model

// --- API Routes ---

app.get('/api/resources', async (req, res) => {
  try {
    const { category, urgency, search } = req.query;
    let filter = {};
    let botMessage = "";

    // 1. Standard Dropdown Filters (Priority)
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    
    // 2. AI Logic (Only if user typed something in the search bar)
    if (search) {
      try {
        // Ask Gemini to classify the input
        const prompt = `
          You are a mental health triage assistant.
          User Input: "${search}"
          
          Task 1: Classify this input into EXACTLY one of these categories: Anxiety, Depression, Stress, Crisis, General.
          Task 2: Write a short, empathetic, 1-sentence response to the user.
          
          Return JSON format only: { "category": "...", "message": "..." }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON from AI
        // (Clean up markdown code blocks if AI adds them)
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const aiAnalysis = JSON.parse(jsonStr);

        // Apply the AI's category to the filter
        filter.category = aiAnalysis.category;
        botMessage = aiAnalysis.message;

      } catch (aiError) {
        console.error("AI Error:", aiError);
        // Fallback if AI fails (e.g. internet issues)
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
        botMessage = "I'm having trouble connecting to my AI brain, but here are some search results.";
      }
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    
    res.json({
      count: resources.length,
      message: botMessage, 
      data: resources
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Other Routes (Unchanged) ---
app.post('/api/resources', async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));