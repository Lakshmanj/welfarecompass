import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'General', urgency: 'Low', link: ''
  });

  // Check Auth & Fetch Data
  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) navigate('/login');
    fetchResources();
  }, [navigate]);

  const fetchResources = async () => {
    const res = await axios.get('http://localhost:5000/api/resources');
    setResources(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // U-05: Edit Logic
        await axios.put(`http://localhost:5000/api/resources/${currentId}`, formData);
        alert('Resource Updated!');
        setIsEditing(false);
        setCurrentId(null);
      } else {
        // U-04: Add Logic
        await axios.post('http://localhost:5000/api/resources', formData);
        alert('Resource Added!');
      }
      // Reset Form and Refresh List
      setFormData({ title: '', description: '', category: 'General', urgency: 'Low', link: '' });
      fetchResources();
    } catch (err) {
      alert('Error processing request.');
    }
  };

  // U-06: Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await axios.delete(`http://localhost:5000/api/resources/${id}`);
      fetchResources();
    }
  };

  // Prepare Form for Editing
  const handleEditClick = (resource) => {
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      urgency: resource.urgency,
      link: resource.link
    });
    setIsEditing(true);
    setCurrentId(resource._id);
    window.scrollTo(0,0); // Scroll to top to see form
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      
      {/* Form Section */}
      <div className="card" style={{borderColor: isEditing ? '#f39c12' : '#2ecc71'}}>
        <h3>{isEditing ? 'Edit Resource' : 'Add New Resource'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          
          <label>Description</label>
          <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          
          <div style={{display:'flex', gap:'10px'}}>
             <div style={{flex:1}}>
                <label>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="General">General</option>
                    <option value="Anxiety">Anxiety</option>
                    <option value="Depression">Depression</option>
                    <option value="Stress">Stress</option>
                    <option value="Crisis">Crisis</option>
                </select>
             </div>
             <div style={{flex:1}}>
                <label>Urgency</label>
                <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
             </div>
          </div>

          <label>Link</label>
          <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} required />

          <button type="submit" style={{backgroundColor: isEditing ? '#f39c12' : '#2ecc71'}}>
            {isEditing ? 'Update Resource' : 'Add Resource'}
          </button>
          
          {isEditing && (
            <button type="button" onClick={() => {setIsEditing(false); setFormData({ title: '', description: '', category: 'General', urgency: 'Low', link: '' });}} style={{marginLeft:'10px', backgroundColor:'#95a5a6'}}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* List Section for Management */}
      <h3>Manage Existing Resources</h3>
      {resources.map(r => (
        <div key={r._id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <strong>{r.title}</strong> <br/>
            <small>{r.category} | {r.urgency}</small>
          </div>
          <div>
            <button onClick={() => handleEditClick(r)} style={{backgroundColor:'#f39c12', marginRight:'5px', padding:'5px 10px'}}>Edit</button>
            <button onClick={() => handleDelete(r._id)} style={{backgroundColor:'#e74c3c', padding:'5px 10px'}}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}


// purpose of the page - this page is particularly going to cover the user story U-04: Adding a Resource