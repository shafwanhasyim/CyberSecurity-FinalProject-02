import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vulnerableToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-cyan-500">
            UserManage
          </Link>
          
          <div className="flex gap-6 items-center">
            {isLoggedIn && (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-cyan-400 transition">
                  Profile
                </Link>
                <Link to="/settings" className="text-gray-300 hover:text-cyan-400 transition">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-300 hover:text-red-400 transition"
                >
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <Link to="/" className="text-gray-300 hover:text-cyan-400 transition">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
