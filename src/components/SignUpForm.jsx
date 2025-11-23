import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, ArrowRight, Shield } from "lucide-react";
import { API_URL } from '../utils/config.js';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [nameValid, setNameValid] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
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
      setPasswordMatch(value === "" ? null : value === formData.confirmPassword);
    }
    if (name === "confirmPassword") {
      setPasswordMatch(value === "" ? null : value === formData.password);
    }
    if (name === "fullName") {
      setNameValid(value === "" ? null : validateName(value));
    }
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return;
    }
    if (!formData.confirmPassword.trim()) {
      setError("Please confirm your password");
      return;
    }
    if (!validateName(formData.fullName)) {
      setError("Please enter a valid full name (at least 2 characters)");
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
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
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
    if (fieldName === "confirmPassword") {
      if (passwordMatch === true) return `${baseClass} ${validClass}`;
      if (passwordMatch === false) return `${baseClass} ${invalidClass}`;
    }
    if (fieldName === "fullName") {
      if (nameValid === true) return `${baseClass} ${validClass}`;
      if (nameValid === false) return `${baseClass} ${invalidClass}`;
    }
    return `${baseClass} ${defaultClass}`;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, color: "gray", text: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const colors = ["red", "orange", "yellow", "lightgreen", "green"];
    const texts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    
    return {
      strength: Math.min(strength, 5),
      color: colors[Math.min(strength - 1, 4)],
      text: texts[Math.min(strength - 1, 4)]
    };
  };

  const passwordStrength = getPasswordStrength();

  const isFormValid = () => {
    return formData.fullName.trim() && 
           formData.email.trim() && 
           formData.password.trim() && 
           formData.confirmPassword.trim() &&
           nameValid === true &&
           emailValid === true &&
           passwordValid === true &&
           passwordMatch === true &&
           termsAccepted;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`pl-10 ${getInputClass("fullName")}`}
              placeholder="Enter your full name"
              required
            />
            {nameValid === true && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
            {nameValid === false && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {nameValid === false && formData.fullName && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Name must be at least 2 characters
            </p>
          )}
        </div>

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
              placeholder="Create a password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.strength
                        ? `bg-${passwordStrength.color}-500`
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                passwordStrength.strength >= 4 ? "text-green-400" :
                passwordStrength.strength >= 3 ? "text-yellow-400" :
                "text-red-400"
              }`}>
                Password strength: {passwordStrength.text}
              </p>
            </div>
          )}
          
          {passwordValid === false && formData.password && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Password must be at least 6 characters
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-20 ${getInputClass("confirmPassword")}`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-12 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {passwordMatch === true && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
            {passwordMatch === false && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {passwordMatch === false && formData.confirmPassword && (
            <p className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-3">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={handleTermsChange}
            required
            className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-800 mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-300">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:text-primary/80">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
            <span className="text-red-500">*</span>
          </label>
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Already have an account?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          to="/login"
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-600 hover:border-gray-500"
        >
          <span>Sign In</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </form>
    </div>
  );
};

export default SignUpForm;