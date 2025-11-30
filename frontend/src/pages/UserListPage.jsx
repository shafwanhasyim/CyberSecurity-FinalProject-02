// src/pages/UserListPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const UserListPage = () => {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setUsers(null);
    try {
      // ⚠️ VULNERABILITY 1: Akses endpoint sensitif tanpa token
      const response = await axios.get('http://localhost:3001/api/users/all'); 
      setUsers(response.data);
      
    } catch (error) {
      setUsers({ error: error.response?.data?.error || 'Gagal mengambil data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">System User List</h2>
      
      <button 
        onClick={fetchUsers}
        disabled={loading}
        className="bg-cyan-600 text-white p-2 rounded font-semibold hover:bg-cyan-500 disabled:opacity-50 mb-6"
      >
        {loading ? 'Loading...' : 'Load All System Users'}
      </button>

      {users && (
        <div className="mt-4 border border-gray-700 p-4 rounded-lg">
          <p className="mb-2 text-sm text-gray-400">Raw Data (UUID, Hash, etc.):</p>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-md overflow-x-auto text-xs max-h-96">
            {JSON.stringify(users, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default UserListPage;