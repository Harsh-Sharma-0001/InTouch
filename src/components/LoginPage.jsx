import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import LoginForm from "./LoginForm";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import { Sparkles, Shield, Zap, Users } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption and advanced security protocols"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed with real-time collaboration"
    },
    {
      icon: Users,
      title: "Team Ready",
      description: "Built for teams of all sizes and industries"
    }
  ];

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
            <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="text-primary mr-3" size={32} />
                  <h1 className="text-4xl font-bold">Welcome Back</h1>
                </div>
                <p className="text-xl text-gray-300 max-w-md">
                  Sign in to continue your journey with InTouch's powerful interview platform
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-4 transform transition-all duration-1000 delay-${(index + 1) * 200} ${
                      isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg backdrop-blur-sm">
                      <feature.icon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500 rounded-full"></div>
          </div>
          
          <div className={`relative z-10 max-w-md w-full space-y-8 transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Logo Section */}
            <div className="text-center">
              <div 
                className="flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => navigate('/')}
              >
                <img
                  src={logo}
                  alt="InTouch Logo"
                  className="w-16 h-16 object-contain rounded-lg shadow-lg"
                />
              </div>
              <Logo />
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Additional Info */}
            <div className="text-center space-y-4">
              
              <p className="text-xs text-gray-400">
                By signing in, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;