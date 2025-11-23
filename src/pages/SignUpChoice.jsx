import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ArrowRight, Users } from 'lucide-react';
import logo from '../assets/logo.jpg';

const SignUpChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-bg to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="flex items-center justify-center mb-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => navigate('/')}
          >
            <img
              src={logo}
              alt="InTouch Logo"
              className="w-16 h-16 object-contain rounded-lg shadow-lg mr-3"
            />
            <h1 className="text-4xl font-bold text-white">InTouch</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Choose Your Account Type</h2>
          <p className="text-gray-400 text-lg">Select how you want to sign up for InTouch</p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Sign Up Card */}
          <div 
            onClick={() => navigate('/signup')}
            className="bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-800 hover:border-primary transition-all duration-300 cursor-pointer group hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <User className="w-10 h-10 text-blue-400" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Sign Up as User</h3>
                <p className="text-gray-400">Create a regular user account</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-left w-full">
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-blue-400 mr-2" />
                  <span>Access to interview rooms</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-blue-400 mr-2" />
                  <span>Participate in interviews</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-blue-400 mr-2" />
                  <span>View your interview history</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-blue-400 mr-2" />
                  <span>Access monitoring features</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 group-hover:shadow-lg">
                <span>Continue as User</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Admin Sign Up Card */}
          <div 
            onClick={() => navigate('/admin/login')}
            className="bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-800 hover:border-primary transition-all duration-300 cursor-pointer group hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-10 h-10 text-primary" />
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Sign Up as Admin</h3>
                <p className="text-gray-400">Access admin panel and management</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-left w-full">
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-primary mr-2" />
                  <span>Full system administration</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-primary mr-2" />
                  <span>User management</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-primary mr-2" />
                  <span>Interview analytics</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <ArrowRight className="w-5 h-5 text-primary mr-2" />
                  <span>System monitoring</span>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 group-hover:shadow-lg">
                <Shield className="w-5 h-5" />
                <span>Continue as Admin</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Info Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-400">
              Need help choosing? Contact support at{' '}
              <a href="mailto:intouch.buisness01@gmail.com" className="text-primary hover:underline">
                intouch.buisness01@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpChoice;

