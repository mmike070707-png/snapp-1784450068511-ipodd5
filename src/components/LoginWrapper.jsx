import React, { useState } from 'react';

export default function LoginWrapper({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('candidate'); // candidate, Employer, Generate Talent here, admin
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Admin Hardcoded Login
    if (email === 'mcneermichael752@gmail.com' && password === 'Ford5150') {
      onLoginSuccess('admin', email);
      return;
    }

    // Employer, Generate Talent here / Candidate Login (Ready to be hooked up to Supabase)
    if (email && password) {
      onLoginSuccess(userType, email);
    } else {
      setError('Please enter both email and password.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 max-w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          TalentNetwork Access
        </h2>
        
        <div className="flex justify-center space-x-2 mb-6">
          <button 
            type="button"
            className={`px-3 py-1 rounded ${userType === 'candidate' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setUserType('candidate')}
          >
            Candidate
          </button>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsSignUp && setIsSignUp(true)} className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer">Looking for work? Sign up here&gt;</button>
          </div>
          <button 
            type="button"
            className={`px-3 py-1 rounded ${userType === 'Employer, Generate Talent here' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setUserType('Employer, Generate Talent here')}
          >
            Employer, Generate Talent here
          </button>
          <button 
            type="button"
            className={`px-3 py-1 rounded ${userType === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setUserType('admin')}
          >
            Admin
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border rounded text-black focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border rounded text-black focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold transition-colors"
          >
            Log In as {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </button>
        </form>
      </div>
    </div>
  );
}
