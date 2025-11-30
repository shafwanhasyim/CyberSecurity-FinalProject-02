// src/pages/AccountSettingsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [targetId, setTargetId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selfPassword, setSelfPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('vulnerableToken');

  if (!token) {
    navigate('/');
    return <div className="text-center text-gray-400">Please login to access settings.</div>;
  }

  // Hanya untuk menampilkan feedback
  const handleSubmit = (type) => async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let url = `http://localhost:3001/api/users/`;
      let payload = {};

      if (type === 'targeted') {
        if (!targetId) return setMessage('Target ID is required for targeted reset.');
        url += `${targetId}/reset_password`;
        payload = { new_password: newPassword };
      } else { // type === 'self'
        const userId = localStorage.getItem('userId');
        url += `${userId}/reset_password`;
        payload = { new_password: selfPassword };
      }
      
      // ⚠️ VULNERABILITY 2: Endpoint ini dipanggil. Jika type='targeted', IDOR akan terjadi.
      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`✅ Success: Password for ${type === 'targeted' ? targetId : 'your account'} has been updated.`);
      
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Server error'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Targeted Reset Form (VULNERABLE IDOR) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-red-600">
        <h3 className="text-xl font-bold mb-4 text-red-500">ADMIN: Targeted Account Reset</h3>
        <p className="text-sm mb-4 text-gray-400">Requires a valid session (your token) to reset any user's password.</p>
        
        <form onSubmit={handleSubmit('targeted')} className="space-y-4">
          <input 
            type="text" 
            placeholder="Target User ID (UUID)" 
            value={targetId} 
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <input 
            type="password" 
            placeholder="New Password for Account" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <button 
            type="submit" 
            className="w-full bg-red-600 text-white p-2 rounded font-semibold hover:bg-red-500"
          >
            Update Account Password
          </button>
        </form>
      </div>

      {/* Self Reset Form (Normal Functionality) */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-cyan-400">Standard Self Password Change</h3>
        <form onSubmit={handleSubmit('self')} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Password (Self)" 
            value={selfPassword} 
            onChange={(e) => setSelfPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <button 
            type="submit" 
            className="w-full bg-cyan-600 text-white p-2 rounded font-semibold hover:bg-cyan-500"
          >
            Change My Password
          </button>
        </form>
      </div>

      {message && <p className={`mt-4 p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message}</p>}
    </div>
  );
};

export default AccountSettingsPage;