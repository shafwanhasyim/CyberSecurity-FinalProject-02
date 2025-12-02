import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export default function ProfilePage() {
  const [targetUserId, setTargetUserId] = useState('');
  const [profile, setProfile] = useState(null);
  const [ownProfile, setOwnProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exploitMode, setExploitMode] = useState(false);

  const token = localStorage.getItem('vulnerableToken');
  const userId = localStorage.getItem('userId');

  const handleViewOwnProfile = async () => {
    if (!token || !userId) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwnProfile(response.data);
      setProfile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTargetProfile = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login first');
      return;
    }

    if (!targetUserId) {
      setError('Please enter a user UUID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/users/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setOwnProfile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">User Profiles</h1>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          ❌ {error}
        </div>
      )}

      {/* My Profile Section */}
      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">My Profile</h2>
        {!token ? (
          <p className="text-gray-400">Please login first</p>
        ) : (
          <button
            onClick={handleViewOwnProfile}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold"
          >
            {loading ? 'Loading...' : 'View My Profile'}
          </button>
        )}

        {ownProfile && (
          <div className="mt-4 bg-gray-700 p-4 rounded space-y-2">
            <p>
              <strong>UUID:</strong> <span className="font-mono text-sm">{ownProfile.id}</span>
            </p>
            <p>
              <strong>Username:</strong> {ownProfile.username}
            </p>
            <p>
              <strong>Email:</strong> {ownProfile.email}
            </p>
            <p>
              <strong>Full Name:</strong> {ownProfile.full_name || '-'}
            </p>
            <p>
              <strong>Admin:</strong> {ownProfile.is_admin ? '✅ Yes' : '❌ No'}
            </p>
            <p>
              <strong>Created:</strong> {new Date(ownProfile.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* View Other User Profile Section */}
      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-xl font-bold mb-4">
          {exploitMode ? '⚠️ IDOR Exploit: View Any User Profile' : 'View User Profile'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">User UUID</label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Paste UUID from Data page"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>

          <button
            onClick={handleViewTargetProfile}
            disabled={loading || !token}
            className={`w-full px-4 py-2 rounded font-semibold ${
              exploitMode
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
                : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600'
            }`}
          >
            {loading ? 'Loading...' : exploitMode ? '🔓 EXPLOIT: View Profile' : 'View Profile'}
          </button>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="exploitMode"
              checked={exploitMode}
              onChange={(e) => setExploitMode(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="exploitMode" className="text-sm">
              Show IDOR Exploit Mode (dangerous)
            </label>
          </div>
        </div>

        {profile && (
          <div className={`mt-4 p-4 rounded space-y-2 ${
            exploitMode ? 'bg-red-900' : 'bg-green-900'
          }`}>
            <p className="font-bold">
              {exploitMode ? '🚨 PROFILE EXPOSED (IDOR)' : '✅ Profile Data'}
            </p>
            <p>
              <strong>UUID:</strong> <span className="font-mono text-sm">{profile.id}</span>
            </p>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Full Name:</strong> {profile.full_name || '-'}
            </p>
            <p>
              <strong>Admin:</strong> {profile.is_admin ? '✅ Yes' : '❌ No'}
            </p>
            <p>
              <strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {exploitMode && (
        <div className="bg-yellow-900 text-yellow-100 p-4 rounded text-sm">
          <strong>⚠️ Vulnerability 3 (IDOR):</strong> Authenticated users can view any user's profile 
          by changing the UUID. There's no authorization check to ensure users can only view their own profiles.
        </div>
      )}
    </div>
  );
}