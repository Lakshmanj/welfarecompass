const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true }, // The external URL
  address: { type: String }, // Physical location address
  
  // Filters required by User Story U-01 & Phase 1 Proposal
  category: { 
    type: String, 
    enum: ['Anxiety', 'Depression', 'Stress', 'General', 'Crisis'],
    default: 'General'
  },
  urgency: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Low' 
  },
  location: { type: String, default: 'Online' }, // e.g., "Toronto", "Online"
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);