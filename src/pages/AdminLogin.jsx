import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, User } from 'lucide-react';
import logo from '../assets/logo.jpg';

const AdminLogin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // First, register the admin user
      const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password,
          isAdmin: true 
        })
      });

      let registerData;
      try {
        registerData = await registerResponse.json();
      } catch (parseError) {
        setError('Server error. Please try again later.');
        setLoading(false);
        return;
      }

      if (!registerResponse.ok) {
        // If user already exists, try to login instead
        const errorMessage = registerData?.message || registerData?.error?.message || 'Registration failed';
        
        if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('user already')) {
          // User already exists, try to login
          const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password })
          });

          let loginData;
          try {
            loginData = await loginResponse.json();
          } catch (parseError) {
            setError('Server error during login. Please try again.');
            setLoading(false);
            return;
          }

          if (loginResponse.ok) {
            // Check if user is admin
            if (!loginData.user?.isAdmin) {
              setError('This account exists but does not have admin privileges. Please contact an administrator to grant admin access.');
              setLoading(false);
              return;
            }

            // Store token and user info
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('user', JSON.stringify(loginData.user));
            localStorage.setItem('userName', loginData.user.name);
            localStorage.setItem('userEmail', loginData.user.email);
            localStorage.setItem('isAdmin', 'true');

            console.log('✅ Admin login successful');
            navigate('/admin');
            return;
          } else {
            const loginErrorMessage = loginData?.message || 'Invalid credentials. Please check your email and password.';
            setError(loginErrorMessage);
          }
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      // Registration successful, wait a moment then login automatically
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch (parseError) {
        setError('Registration successful! Please try logging in manually.');
        setLoading(false);
        return;
      }

      if (loginResponse.ok && loginData.user) {
        // Verify admin status
        if (!loginData.user.isAdmin) {
          setError('Account created but admin privileges were not granted. Please contact an administrator.');
          setLoading(false);
          return;
        }

        // Store token and user info
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        localStorage.setItem('userName', loginData.user.name);
        localStorage.setItem('userEmail', loginData.user.email);
        localStorage.setItem('isAdmin', 'true');

        console.log('✅ Admin signup and login successful');
        navigate('/admin');
      } else {
        const loginErrorMessage = loginData?.message || 'Registration successful but login failed. Please try logging in manually.';
        setError(loginErrorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      if (error.message) {
        setError(`Error: ${error.message}. Please check your connection and try again.`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-bg to-gray-900 flex items-center justify-center px-4">
      <style>{`
        input[type="email"]:-webkit-autofill,
        input[type="email"]:-webkit-autofill:hover,
        input[type="email"]:-webkit-autofill:focus,
        input[type="password"]:-webkit-autofill,
        input[type="password"]:-webkit-autofill:hover,
        input[type="password"]:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #1f2937 inset !important;
          box-shadow: 0 0 0px 1000px #1f2937 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input[type="email"],
        input[type="password"],
        input[type="text"] {
          color: #ffffff !important;
        }
      `}</style>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Signup</h1>
          <p className="text-gray-400">Create your admin account to access the admin panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-800">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                  style={{ color: '#ffffff' }}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="admin@intouch.com"
                  style={{ color: '#ffffff' }}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  style={{ color: '#ffffff' }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  style={{ color: '#ffffff' }}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Sign Up as Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              Already have an admin account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Admin Login
              </button>
            </p>
            <p className="text-center text-sm text-gray-400 mt-2">
              Not an admin?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign Up as User
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure admin access • All actions are logged
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


