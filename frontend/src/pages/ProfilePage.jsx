// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Ambil ID dari URL (untuk IDOR)
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '' });

  const token = localStorage.getItem('vulnerableToken');
  const loggedInUserId = localStorage.getItem('userId');
  
  // Tentukan ID yang akan diambil: dari URL, atau dari token (jika URL kosong)
  const targetId = id || loggedInUserId;

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (targetId) {
      fetchProfile(targetId);
    }
  }, [token, targetId, navigate]);

  const fetchProfile = async (fetchId) => {
    setMessage('');
    try {
      // ⚠️ VULNERABILITY 3 (IDOR): Endpoint rentan. Jika fetchId adalah ID orang lain, data orang lain akan muncul.
      const response = await axios.get(`http://localhost:3001/api/users/${fetchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      if (fetchId === loggedInUserId) {
        setForm({ full_name: response.data.full_name || '', email: response.data.email || '' });
      } else {
        setForm({ full_name: 'READ ONLY', email: 'READ ONLY' }); // Disable form jika IDOR
        setMessage(`Viewing Profile of: ${response.data.username}`);
      }
    } catch (error) {
      setMessage(`Error loading profile: ${error.response?.data?.error || 'Failed to connect.'}`);
      setUser(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (id && id !== loggedInUserId) return; // Block update jika sedang mode IDOR view
    setMessage('');
    try {
      await axios.put(`http://localhost:3001/api/users/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully.');
      fetchProfile(loggedInUserId);
    } catch (error) {
      setMessage(`Update Error: ${error.response?.data?.error || 'Server error'}`);
    }
  };

  if (!user) return <div className="text-center text-gray-400">Loading or not authenticated...</div>;

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className={`text-2xl font-bold mb-4 ${id ? 'text-red-500' : 'text-cyan-400'}`}>
        {id && id !== loggedInUserId ? 'External Account Details' : 'My Profile Details'}
      </h2>
      
      <div className="mb-6 space-y-2 text-sm border-b border-gray-700 pb-4">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>UUID:</strong> {user.id}</p>
        <p><strong>Is Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
        <p className="text-xs text-gray-500">Accessing ID: {targetId}</p>
      </div>

      {id && id !== loggedInUserId ? (
        <div className="text-red-400">Note: Data loaded via URL parameter.</div>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-3">Update Information</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={form.full_name} 
              onChange={(e) => setForm({...form, full_name: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            />
            <button 
              type="submit" 
              className="w-full bg-cyan-600 text-white p-2 rounded font-semibold hover:bg-cyan-500"
            >
              Save Changes
            </button>
          </form>
        </>
      )}
      {message && <p className={`mt-4 p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message}</p>}
    </div>
  );
};

export default ProfilePage;