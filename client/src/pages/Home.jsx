import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [aiQuery, setAiQuery] = useState(''); // For U-07
  
  // Modal State for U-02
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    // If user is typing "natural language", we use the search param
    // Otherwise we use the filters
    const params = {};
    if (category) params.category = category;
    if (urgency) params.urgency = urgency;
    if (aiQuery) params.search = aiQuery; 

    axios.get('http://localhost:5000/api/resources', { params })
      .then(res => setResources(res.data))
      .catch(err => console.error(err));
  }, [category, urgency, aiQuery]);

  return (
    <div className="container">
      
      {/* U-07: AI Assistant / Smart Search */}
      <div className="card ai-section">
        <h3 style={{marginTop:0}}>🤖 AI Assistant</h3>
        <p style={{margin:'5px 0'}}>Describe what you need (e.g., "I feel anxious" or "crisis help")</p>
        <input 
          type="text" 
          placeholder="Type here..." 
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          style={{marginBottom:0}}
        />
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'20px'}}>
        <h2>Resources</h2>
        
        {/* U-01: Filters */}
        <div style={{display:'flex', gap:'10px'}}>
            <select onChange={e => setCategory(e.target.value)} value={category}>
                <option value="">Categories</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Depression">Depression</option>
                <option value="Stress">Stress</option>
                <option value="Crisis">Crisis</option>
            </select>
            <select onChange={e => setUrgency(e.target.value)} value={urgency}>
                <option value="">All Urgency</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        </div>
      </div>

      {resources.length === 0 && <p>No resources found.</p>}

      {resources.map(r => (
        <div key={r._id} className="card">
          <h3>{r.title}</h3>
          <p>{r.description.substring(0, 100)}...</p>
          <div style={{marginBottom:'10px'}}>
            <span className={`tag Urgency-${r.urgency}`}>{r.urgency}</span>
            <span className="tag Category">{r.category}</span>
          </div>
          {/* U-02: View Details Trigger */}
          <button onClick={() => setSelectedResource(r)} style={{backgroundColor:'#3498db'}}>
            View Details
          </button>
        </div>
      ))}

      {/* U-02: View Details Modal */}
      {selectedResource && (
        <div style={{
            position:'fixed', top:0, left:0, right:0, bottom:0, 
            backgroundColor:'rgba(0,0,0,0.5)', display:'flex', 
            justifyContent:'center', alignItems:'center'
        }}>
            <div style={{background:'white', padding:'30px', borderRadius:'8px', maxWidth:'500px', width:'90%'}}>
                <h2>{selectedResource.title}</h2>
                <p><strong>Category:</strong> {selectedResource.category}</p>
                <p><strong>Urgency:</strong> {selectedResource.urgency}</p>
                <p>{selectedResource.description}</p>
                <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between'}}>
                    <a href={selectedResource.link} target="_blank" rel="noreferrer" style={{
                        background:'#2ecc71', color:'white', padding:'10px 20px', textDecoration:'none', borderRadius:'4px'
                    }}>Visit Website</a>
                    <button onClick={() => setSelectedResource(null)} style={{background:'#e74c3c'}}>Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// purpose of the page - this page is particularly going to cover the user story U-01: Filtering Resources