import React, { useState, useEffect } from 'react'
import { BarChart3, Calendar, Settings, Monitor, User } from 'lucide-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { API_URL } from '../utils/config.js'

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check admin status from localStorage
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(storedIsAdmin);

    // Verify admin status from server if token exists
    const token = localStorage.getItem('token');
    if (token) {
      verifyAdminStatus();
    }
  }, []);

  const verifyAdminStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
        localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Failed to verify admin status:', error);
    }
  };

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: Calendar, label: 'Interview Room', path: '/interview', active: location.pathname === '/interview' },
    ...(isAdmin ? [{ icon: Settings, label: 'Admin Panel', path: '/admin', active: location.pathname === '/admin' }] : []),
    { icon: Monitor, label: 'Monitoring', path: '/monitoring', active: location.pathname === '/monitoring' },
  ]

  return (
    <div className="w-64 bg-dark-card h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate('/')}
        >
          <div className="flex space-x-1">
            <div className="w-2 h-6 bg-white rounded"></div>
            <div className="w-2 h-6 bg-primary rounded"></div>
            <div className="w-2 h-6 bg-white rounded"></div>
          </div>
          <span className="text-xl font-bold">InTouch</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-gray-text hover:bg-dark-lighter hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <div className="text-sm font-medium">
              {localStorage.getItem('userName') || 'User'}
            </div>
            <div className="text-xs text-gray-text">
              {localStorage.getItem('userEmail') || 'user@example.com'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
