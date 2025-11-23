import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Video, Settings, Activity, User } from 'lucide-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

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
      const response = await fetch('http://localhost:5000/api/auth/verify-admin', {
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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: Video, label: 'Interview Room', path: '/interview', active: location.pathname === '/interview' },
    ...(isAdmin ? [{ icon: Settings, label: 'Admin Panel', path: '/admin', active: location.pathname === '/admin' }] : []),
    { icon: Activity, label: 'Monitoring', path: '/monitoring', active: location.pathname === '/monitoring' },
  ]

  return (
    <div className="w-64 bg-sidebar-bg border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IT</span>
          </div>
          <span className="text-white font-semibold text-lg">InTouch</span>
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
                    ? 'bg-accent-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-gray-300" />
          </div>
          <div>
            <p className="text-white font-medium">
              {localStorage.getItem('userName') || 'User'}
            </p>
            <p className="text-gray-400 text-sm">
              {localStorage.getItem('isAdmin') === 'true' ? 'Admin' : 'User'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
