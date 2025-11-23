import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { API_URL } from '../utils/config.js';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const remembered = localStorage.getItem('rememberMe') === 'true';
    
    if (remembered && savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setRememberMe(true);
      setEmailValid(true);
      setPasswordValid(true);
    }
  }, []);

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
    setError("");

    // Real-time validation
    if (name === "email") {
      setEmailValid(value === "" ? null : validateEmail(value));
    }
    if (name === "password") {
      setPasswordValid(value === "" ? null : validatePassword(value));
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Login successful! Redirecting...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userToken", data.token); // Keep for backward compatibility
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Store admin status
        if (data.user.isAdmin) {
          localStorage.setItem("isAdmin", "true");
        } else {
          localStorage.setItem("isAdmin", "false");
        }
        
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
        
        // Add a small delay for better UX
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setError(data.message || "Login failed. Please check your credentials and try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50";
    const validClass = "border-green-500 bg-green-500/5";
    const invalidClass = "border-red-500 bg-red-500/5";
    const defaultClass = "border-gray-600 bg-gray-800 text-white placeholder-gray-400";
    
    if (fieldName === "email") {
      if (emailValid === true) return `${baseClass} ${validClass}`;
      if (emailValid === false) return `${baseClass} ${invalidClass}`;
    }
    if (fieldName === "password") {
      if (passwordValid === true) return `${baseClass} ${validClass}`;
      if (passwordValid === false) return `${baseClass} ${invalidClass}`;
    }
    return `${baseClass} ${defaultClass}`;
  };

  const isFormValid = () => {
    return formData.email.trim() && 
           formData.password.trim() && 
           emailValid === true && 
           passwordValid === true;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`pl-10 ${getInputClass("email")}`}
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
          {emailValid === false && formData.email && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`pl-10 pr-20 ${getInputClass("password")}`}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {passwordValid === true && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
            {passwordValid === false && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {passwordValid === false && formData.password && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Password must be at least 6 characters
            </p>
          )}
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error/Success Messages */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Demo Credentials */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Demo Credentials:</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <p><strong>Admin:</strong> admin@intouch.com / admin123</p>
            <p><strong>User:</strong> user@example.com / password123</p>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">New to InTouch?</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link
          to="/signup-choice"
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-600 hover:border-gray-500"
        >
          <span>Create Account</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;