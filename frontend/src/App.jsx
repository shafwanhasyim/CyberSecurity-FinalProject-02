// src/App.jsx
import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UserListPage from './pages/UserListPage';
import ProfilePage from './pages/ProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md transition-colors font-medium text-sm"
  >
    {children}
  </Link>
);

function App() {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem('vulnerableToken'),
    isAdmin: localStorage.getItem('isAdmin') === 'true'
  }));

  useEffect(() => {
    const updateSession = () => {
      setSession({
        token: localStorage.getItem('vulnerableToken'),
        isAdmin: localStorage.getItem('isAdmin') === 'true'
      });
    };

    window.addEventListener('session-update', updateSession);
    window.addEventListener('storage', updateSession);
    return () => {
      window.removeEventListener('session-update', updateSession);
      window.removeEventListener('storage', updateSession);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-cyan-400">
              MinimalApp
            </Link>
            <div className="flex space-x-2">
              <NavLink to="/">Auth</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/settings">Settings</NavLink>
              {session.token && session.isAdmin && <NavLink to="/users">Users</NavLink>}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/users"
            element={session.token && session.isAdmin ? <UserListPage /> : <AuthPage />}
          /> 
          <Route path="/profile/:id?" element={<ProfilePage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;