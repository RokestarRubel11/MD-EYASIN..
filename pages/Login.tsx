
import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, setUsers }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Note: Mocking real auth, ignoring password for demo
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegister) {
      if (!name || !email) return setError('Please fill all fields');
      if (users.find(u => u.email === email)) return setError('Email already exists');
      
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'SALESMAN',
        status: 'PENDING',
        permissions: []
      };
      
      setUsers([...users, newUser]);
      setSuccess('Account created! Wait for admin approval.');
      setIsRegister(false);
    } else {
      const user = users.find(u => u.email === email);
      if (!user) return setError('User not found');
      if (user.status === 'PENDING') return setError('Account pending admin approval');
      
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">KHMTEAM</h1>
          <p className="text-gray-500">{isRegister ? 'Register your salesman account' : 'Business Management Portal'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2 border border-red-200">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center space-x-2 border border-green-200">
            <div className="w-5 h-5 flex-shrink-0 bg-green-500 text-white rounded-full flex items-center justify-center">✓</div>
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email (Gmail preferred)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="example@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-2 font-bold text-blue-600 hover:text-blue-700 underline"
            >
              {isRegister ? 'Sign In' : 'Sign up as Salesman'}
            </button>
          </p>
          {!isRegister && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700 text-left">
              <strong>Admin Access:</strong> roki255190@gmail.com
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
