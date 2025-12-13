import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  
  // 1. aiQuery: Updates instantly as you type
  const [aiQuery, setAiQuery] = useState('');
  
  // 2. finalQuery: The one that actually triggers the API
  const [finalQuery, setFinalQuery] = useState('');
  
  const [botResponse, setBotResponse] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECT 1: Handle the 5-Second Auto-Send ---
  useEffect(() => {
    // If the box is empty, don't set a timer
    if (!aiQuery.trim()) return;

    // DEBUG: Log that typing has started/continued
    console.log(`Typing detected: "${aiQuery}". Resetting 5s timer...`);

    // Set a timer for 5 seconds (5000ms)
    const timer = setTimeout(() => {
      if (aiQuery !== finalQuery) {
        console.log("⏳ Auto-send timer finished. Triggering search for:", aiQuery);
        setFinalQuery(aiQuery);
      }
    }, 5000); // <--- CHANGED TO 5 SECONDS

    // Cleanup: If user types again before 5s, this clears the old timer
    return () => clearTimeout(timer);
  }, [aiQuery, finalQuery]);


  // --- EFFECT 2: The API Call (Listens to finalQuery) ---
  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (urgency) params.urgency = urgency;
    if (finalQuery) params.search = finalQuery; 

    setIsLoading(true);
    
    // DEBUG: Log the outgoing request
    console.log("🚀 Sending API Request with params:", params);

    axios.get('http://localhost:5000/api/resources', { params })
      .then(res => {
        setIsLoading(false);
        
        // DEBUG: Log the full response from Server/AI
        console.log("✅ API Response Received:", res.data);
        
        if (res.data && Array.isArray(res.data.data)) {
          setResources(res.data.data);
          setBotResponse(res.data.message || '');
          console.log("🤖 AI Message:", res.data.message);
        } else if (Array.isArray(res.data)) {
            setResources(res.data);
            setBotResponse('');
        } else {
            console.warn("⚠️ Unexpected response format:", res.data);
            setResources([]); 
        }
      })
      .catch(err => {
        console.error("❌ Browser API Error:", err);
        setIsLoading(false);
        setResources([]); 
      });
      
  }, [category, urgency, finalQuery]); // Runs when these change

  // Helper to trigger search immediately
  const handleManualSearch = () => {
    console.log("👆 Manual 'Send' clicked.");
    setFinalQuery(aiQuery);
  };

  return (
    <div className="container">
      
      {/* AI Assistant Section */}
      <div className="card ai-section">
        <h3 style={{marginTop:0}}>🤖 AI Assistant</h3>
        <p style={{margin:'5px 0', color:'#555'}}>Describe your situation naturally (e.g., "I feel overwhelmed with school").</p>
        
        <div style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
          <input 
            type="text" 
            placeholder="Type here..." 
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            // Allow pressing "Enter" to send immediately
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            style={{marginBottom: '10px', flex: 1}}
          />
          <button 
            onClick={handleManualSearch}
            style={{
                height: '46px', // Match input height roughly
                marginTop: '8px', 
                background: '#2563eb',
                whiteSpace: 'nowrap'
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>

        {/* The Human Response Message */}
        {botResponse && finalQuery && (
          <div style={{
            background: '#fff', 
            padding: '15px', 
            borderRadius: '12px', 
            borderLeft: '4px solid #2563eb',
            marginTop: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            fontStyle: 'italic',
            color: '#333'
          }}>
            "{botResponse}"
          </div>
        )}
      </div>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'30px', marginBottom:'20px'}}>
        <h2 style={{margin:0}}>Resources</h2>
        
        {/* Filters */}
        <div style={{display:'flex', gap:'10px'}}>
            <select onChange={e => setCategory(e.target.value)} value={category}>
                <option value="">Category</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Depression">Depression</option>
                <option value="Stress">Stress</option>
                <option value="Crisis">Crisis</option>
            </select>
            <select onChange={e => setUrgency(e.target.value)} value={urgency}>
                <option value="">Urgency</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
        </div>
      </div>

      {Array.isArray(resources) && resources.length === 0 && !isLoading && (
        <p style={{textAlign:'center', color:'#888', marginTop:'40px'}}>No resources found matching your criteria.</p>
      )}

      {/* Loading Indicator */}
      {isLoading && <p style={{textAlign:'center', color:'#2563eb'}}>Asking AI...</p>}

      {Array.isArray(resources) && resources.map(r => (
        <div key={r._id} className="card">
          <h3>{r.title}</h3>
          <p>{r.description.substring(0, 100)}...</p>
          <div style={{marginBottom:'15px'}}>
            <span className={`tag Urgency-${r.urgency}`}>{r.urgency}</span>
            <span className="tag Category">{r.category}</span>
          </div>
          <button onClick={() => setSelectedResource(r)} style={{backgroundColor:'#2563eb'}}>
            View Details
          </button>
        </div>
      ))}

      {/* Modal Overlay */}
      {selectedResource && (
        <div className="modal-overlay">
            <div style={{background:'white', padding:'30px', borderRadius:'12px', maxWidth:'600px', width:'90%', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'}}>
                <h2 style={{marginTop:0}}>{selectedResource.title}</h2>
                <div style={{marginBottom:'20px'}}>
                    <span className="tag Category">{selectedResource.category}</span>
                    <span className={`tag Urgency-${selectedResource.urgency}`}>{selectedResource.urgency} Urgency</span>
                </div>
                <p style={{lineHeight:'1.6', color:'#444'}}>{selectedResource.description}</p>
                <hr style={{border:'0', borderTop:'1px solid #eee', margin:'20px 0'}}/>
                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                    <button onClick={() => setSelectedResource(null)} style={{background:'#94a3b8', color:'white'}}>Close</button>
                    <a href={selectedResource.link} target="_blank" rel="noreferrer" style={{
                        background:'#10b981', color:'white', padding:'12px 24px', textDecoration:'none', borderRadius:'8px', fontWeight:'600', display:'inline-block'
                    }}>Visit Website</a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}