// import React from 'react'
// import { Bell, LogOut } from 'lucide-react'

// const Header = () => {
//   return (
//     <header className="bg-dark border-b border-gray-700 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-8">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
//               <span className="text-white font-bold text-sm">IT</span>
//             </div>
//             <span className="text-white font-semibold text-lg">InTouch</span>
//           </div>
          
//           <nav className="flex items-center space-x-6">
//             <a href="#" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
//             <a href="#" className="text-primary font-medium">Interview Room</a>
//             <a href="#" className="text-gray-300 hover:text-white transition-colors">Admin Panel</a>
//             <a href="#" className="text-gray-300 hover:text-white transition-colors">Monitoring</a>
//           </nav>
//         </div>

//         <div className="flex items-center space-x-4">
//           <button className="text-gray-300 hover:text-white transition-colors">
//             <Bell size={20} />
//           </button>
//           <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
//             <LogOut size={20} />
//             <span>Logout</span>
//           </button>
//           <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">1</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Header







// import React from 'react';
// import { Bell, LogOut, User } from 'lucide-react'; // Import User icon
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import logo from '../assets/logo.jpg'; // Import your logo

// const Header = () => {
//   const navigate = useNavigate(); // Initialize useNavigate
//   const navItems = ['Dashboard', 'Interview Room', 'Admin Panel', 'Monitoring'];

//   const handleLogout = () => {
//     localStorage.removeItem("userToken"); // Clear the token
//     localStorage.removeItem("userName");  // Clear user name
//     localStorage.removeItem("userEmail"); // Clear user email
//     navigate("/login"); // Redirect to the login page
//   };

//   // Determine the active path for the navigation items
//   // This assumes the current path is '/interview' for InterviewHeader
//   const currentPath = '/interview'; // Hardcode for InterviewHeader, or pass as prop if dynamic

//   return (
//     <header className="bg-dark-card border-b border-border-color px-6 py-4 flex items-center justify-between">
//       {/* Left side: Logo and Navigation Tabs */}
//       <div className="flex items-center space-x-8">
//         <div className="flex items-center space-x-2">
//           <img src={logo} alt="InTouch Logo" className="w-10 h-10 object-contain" /> {/* Use logo.jpg */}
//           <span className="text-white font-bold text-lg">InTouch</span>
//         </div>
//         <nav className="flex space-x-8">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={
//                 item === 'Dashboard' ? '/dashboard' :
//                 item === 'Interview Room' ? '/interview' :
//                 item === 'Admin Panel' ? '/admin' :
//                 item === 'Monitoring' ? '/monitoring' : '#'
//               } // Use actual paths for navigation
//               className={`px-4 py-2 text-sm font-medium transition-colors relative ${
//                 // Set active state based on currentPath matching the item's implied path
//                 (item === 'Dashboard' && currentPath === '/dashboard') ||
//                 (item === 'Interview Room' && currentPath === '/interview') ||
//                 (item === 'Admin Panel' && currentPath === '/admin') ||
//                 (item === 'Monitoring' && currentPath === '/monitoring')
//                   ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' // Active state with underline
//                   : 'text-gray-text hover:text-white'
//               }`}
//             >
//               {item}
//             </a>
//           ))}
//         </nav>
//       </div>

//       {/* Right Side */}
//       <div className="flex items-center space-x-4">
//         <button className="p-2 text-gray-text hover:text-white transition-colors">
//           <Bell size={20} />
//         </button>
//         {/* Apply the handleLogout function to this button */}
//         <button
//           onClick={handleLogout} // Assign the logout handler here
//           className="flex items-center space-x-2 text-gray-text hover:text-white transition-colors"
//         >
//           <span className="text-sm">Logout</span>
//           <LogOut size={16} />
//         </button>
//         {/* Profile picture/icon - assuming this is for the logged-in user */}
//         <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//           <User size={16} className="text-white" /> {/* Use User icon */}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;






import React, { useEffect, useState } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = ['Dashboard', 'Interview Room', 'Admin Panel', 'Monitoring'];

  // Real-time timer
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = n => n.toString().padStart(2, '0');
  const timer = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

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
      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {timer}
        </div>
        <button className="p-2 text-gray-text hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-text hover:text-white transition-colors"
        >
          <span className="text-sm">Logout</span>
          <LogOut size={16} />
        </button>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;