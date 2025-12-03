// src/pages/AccountSettingsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccountSettingsPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('vulnerableToken');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    navigate('/');
    return <div className="text-center text-gray-400">Please login to access settings.</div>;
  }

  // --- Handle Form Submission (Self Password Change) ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentPassword || !newPassword) {
      return setMessage('Error: Current and new password are required.');
    }

    try {
      const url = `http://localhost:3001/api/users/reset_password`;

      await axios.post(url, {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage(`✅ Success: Your password has been successfully changed.`);
      setCurrentPassword('');
      setNewPassword('');
      
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Server error'}`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Form Sederhana: Hanya Ganti Password Sendiri */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-cyan-400">Change Account Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
          />
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)}
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
      
      <p className="text-xs text-gray-500 pt-4 border-t border-gray-700">
          Current session ID used in request: {userId}
      </p>
    </div>
  );
};

export default AccountSettingsPage;