import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    try {
      await register({ name, email, password });
      alert('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-brand-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              B
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create your Account</h1>
          <p className="text-brand-gray-500 mt-2">Join the BAOAI Insight platform today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-gray-600 mb-2">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-gray-600 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-gray-600 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full bg-brand-purple hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-brand-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-purple hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
