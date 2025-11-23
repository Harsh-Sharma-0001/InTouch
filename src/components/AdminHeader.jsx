import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = ['Dashboard', 'Interview Room', 'Admin Panel', 'Monitoring'];

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <header className="bg-dark-card border-b border-border-color px-6 py-4 flex items-center justify-between">
      {/* Left side: Logo and Navigation Tabs */}
      <div className="flex items-center space-x-8">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="InTouch Logo" className="w-11 h-11 object-contain rounded-lg" />
          <span className="text-white font-bold text-lg">InTouch</span>
        </div>
        <nav className="flex space-x-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={
                item === 'Dashboard' ? '/dashboard' :
                item === 'Interview Room' ? '/interview' :
                item === 'Admin Panel' ? '/admin' :
                item === 'Monitoring' ? '/monitoring' : '#'
              }
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                location.pathname === (
                  item === 'Dashboard' ? '/dashboard' :
                  item === 'Interview Room' ? '/interview' :
                  item === 'Admin Panel' ? '/admin' :
                  item === 'Monitoring' ? '/monitoring' : '#'
                )
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                  : 'text-gray-text hover:text-white'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* Right side: Timer, Notifications, User, Logout */}
      <div className="flex items-center space-x-6">
        {/* Timer */}
        <div className="text-white text-sm font-medium">
          00:30
        </div>

        {/* Notifications */}
        <button className="text-gray-text hover:text-white transition-colors">
          <Bell size={20} />
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="text-gray-text hover:text-white transition-colors flex items-center space-x-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

        {/* User Profile */}
        <button className="text-gray-text hover:text-white transition-colors">
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;