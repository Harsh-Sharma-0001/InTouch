import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { API_URL } from '../utils/config.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: verification, 3: new password, 4: success
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    if (name === 'email') {
      setEmailValid(value === '' ? null : validateEmail(value));
    }
    if (name === 'newPassword') {
      setPasswordValid(value === '' ? null : validatePassword(value));
      setPasswordMatch(value === '' ? null : value === formData.confirmPassword);
    }
    if (name === 'confirmPassword') {
      setPasswordMatch(value === '' ? null : value === formData.newPassword);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Verification code sent to your email! Please check your inbox and spam folder.');
        setStep(2);
        setCountdown(60); // 60 seconds countdown
      } else {
        setError(data.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Code verified successfully!');
        setStep(3);
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword(formData.newPassword)) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password reset successfully!');
        setStep(4);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('New verification code sent!');
        setCountdown(60);
      } else {
        setError(data.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = 'w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50';
    const validClass = 'border-green-500 bg-green-500/5';
    const invalidClass = 'border-red-500 bg-red-500/5';
    const defaultClass = 'border-gray-600 bg-gray-800 text-white placeholder-gray-400';
    
    if (fieldName === 'email') {
      if (emailValid === true) return `${baseClass} ${validClass}`;
      if (emailValid === false) return `${baseClass} ${invalidClass}`;
    }
    if (fieldName === 'newPassword') {
      if (passwordValid === true) return `${baseClass} ${validClass}`;
      if (passwordValid === false) return `${baseClass} ${invalidClass}`;
    }
    if (fieldName === 'confirmPassword') {
      if (passwordMatch === true) return `${baseClass} ${validClass}`;
      if (passwordMatch === false) return `${baseClass} ${invalidClass}`;
    }
    return `${baseClass} ${defaultClass}`;
  };

  const renderStep1 = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div 
          className="flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="InTouch Logo" className="w-16 h-16 object-contain rounded-lg shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600">Enter your email address and we'll send you a verification code to reset your password.</p>
      </div>

      <form onSubmit={handleSendResetCode} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`pl-10 ${getInputClass('email')}`}
              placeholder="Enter your email"
              required
            />
            {emailValid === true && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
            {emailValid === false && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {emailValid === false && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Please enter a valid email address
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.email}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending code...</span>
            </>
          ) : (
            <>
              <span>Send Reset Code</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <div className="text-center">
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 text-sm flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h1>
        <p className="text-gray-600">We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Verification Code</label>
          <input
            type="text"
            name="verificationCode"
            value={formData.verificationCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.verificationCode || formData.verificationCode.length !== 6}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify Code</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <div className="text-center space-y-2">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">Resend code in {countdown}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-primary hover:text-primary/80 text-sm disabled:text-gray-500"
            >
              Resend verification code
            </button>
          )}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 text-sm flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
        <p className="text-gray-600">Create a new secure password for your account</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-20 ${getInputClass('newPassword')}`}
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordValid === false && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Password must be at least 6 characters
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-20 ${getInputClass('confirmPassword')}`}
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordMatch === false && formData.confirmPassword && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Passwords do not match
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Resetting password...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderStep4 = () => (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h1>
        <p className="text-gray-600">Your password has been updated. You can now log in with your new password.</p>
      </div>

      <Link
        to="/login"
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      >
        <span>Go to Login</span>
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <div className="flex flex-1">
        {/* Left side - Enhanced Network Background */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-600/20 to-blue-600/20"></div>
          
          {/* Animated Network Lines */}
          <div className="absolute inset-0 network-lines opacity-30"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-blue-500 rounded-full opacity-30 animate-pulse delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-primary rounded-full opacity-50 animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-purple-500 rounded-full opacity-60 animate-pulse delay-1500"></div>
          
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Password Recovery</h1>
              <p className="text-xl text-gray-300 max-w-md">
                Secure and reliable password reset process to get you back to your account quickly
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500 rounded-full"></div>
          </div>
          
          <div className="relative z-10 w-full">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 
