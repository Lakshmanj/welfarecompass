import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('isAdmin', 'true'); // Simple storage for Sprint 2
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid Username or Password');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{textAlign:'center'}}>Admin Portal</h2>
        {error && <p style={{color:'red', textAlign:'center'}}>{error}</p>}
        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Username" />
          
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter Password" />
          
          <button type="submit" style={{width:'100%'}}>Login</button>
        </form>
      </div>
    </div>
  );
}

// purpose of the page - this page is particularly going to cover the user story U-03: Admin login