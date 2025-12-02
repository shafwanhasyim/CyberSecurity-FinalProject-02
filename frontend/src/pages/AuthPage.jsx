// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const payload = isLogin ? { username, password } : { username, email, password };
      const response = await axios.post(`http://localhost:3001/api/auth/${endpoint}`, payload);
      
      if (isLogin) {
        localStorage.setItem('vulnerableToken', response.data.token);
        localStorage.setItem('userId', response.data.id); 
        setMessage(`Success: Logged in.`);
      } else {
        setMessage('Success: Registration complete. Please login.');
      }
      
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Server error'}`);
    }
  };
  
  const Form = (
    <form onSubmit={handleAuth} className="space-y-4">
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
      />
      {!isLogin && (
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
        />
      )}
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
      />
      <button 
        type="submit" 
        className="w-full bg-cyan-600 text-white p-2 rounded font-semibold hover:bg-cyan-500"
      >
        {isLogin ? 'Login' : 'Register'}
      </button>
    </form>
  );

  return (
    <div className="max-w-sm mx-auto bg-gray-800 p-6 rounded-lg shadow-xl text-white">
      <div className="flex mb-4">
        <button 
          onClick={() => setIsLogin(true)}
          className={`w-1/2 p-2 rounded-l-lg font-semibold ${isLogin ? 'bg-cyan-600' : 'bg-gray-700'}`}
        >
          Login
        </button>
        <button 
          onClick={() => setIsLogin(false)}
          className={`w-1/2 p-2 rounded-r-lg font-semibold ${!isLogin ? 'bg-cyan-600' : 'bg-gray-700'}`}
        >
          Register
        </button>
      </div>
      {Form}
      {message && <p className={`mt-4 p-3 rounded text-sm ${message.includes('Success') ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>{message}</p>}
      <button 
        onClick={() => localStorage.clear()}
        className="mt-4 text-xs text-gray-400 hover:text-red-500"
      >
        Clear Session (Logout)
      </button>
    </div>
  );
};

export default AuthPage;