import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/users/all`);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All System Users</h1>
        <button
          onClick={fetchAllUsers}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded font-semibold"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          ❌ Error: {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded">
          ⏳ Loading users...
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="bg-gray-700 text-gray-100 p-4 rounded">
          No users found
        </div>
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 bg-gray-800">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">UUID</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Admin</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-2 text-xs font-mono truncate" title={user.id}>
                    {user.id.substring(0, 12)}...
                  </td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.full_name || '-'}</td>
                  <td className="px-4 py-2">{user.is_admin ? '✅ Yes' : '❌ No'}</td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-yellow-900 text-yellow-100 p-4 rounded text-sm">
        ⚠️ <strong>Vulnerability 1 (No Auth):</strong> This page loads without authentication token. 
        Anyone can see all users including their data.
      </div>
    </div>
  );
}