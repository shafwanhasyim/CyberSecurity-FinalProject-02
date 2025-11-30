// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '' });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('vulnerableToken');

  useEffect(() => {
    if (!token || !userId) {
      navigate('/');
      return;
    }
    fetchProfile(userId);
  }, [token, userId, navigate]);

  const fetchProfile = async (id) => {
    try {
      // ⚠️ VULNERABILITY 3 (IDOR): Endpoint ini rentan, tapi kita pakai ID sendiri.
      const response = await axios.get(`http://localhost:3001/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setForm({ full_name: response.data.full_name, email: response.data.email });
    } catch (error) {
      setMessage(`Error loading profile: ${error.response?.data?.error || 'Failed to connect.'}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.put(`http://localhost:3001/api/users/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully.');
      fetchProfile(userId); // Reload data
    } catch (error) {
      setMessage(`Update Error: ${error.response?.data?.error || 'Server error'}`);
    }
  };

  if (!user) return <div className="text-center text-gray-400">Loading or not authenticated...</div>;

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">My Profile Details</h2>
      
      <div className="mb-6 space-y-2 text-sm">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>UUID:</strong> {user.id}</p>
        <p><strong>Is Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
      </div>

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
      {message && <p className={`mt-4 p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message}</p>}
    </div>
  );
};

export default ProfilePage;