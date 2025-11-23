// import React from 'react'
// import { Bell, LogOut, User } from 'lucide-react'

// const Header = () => {
//   const navItems = ['Dashboard', 'Interview Room', 'Admin Panel', 'Monitoring']

//   return (
//     <header className="bg-sidebar-bg border-b border-gray-700 px-6 py-4">
//       <div className="flex items-center justify-between">
//         {/* Navigation */}
//         <nav className="flex items-center space-x-8">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href="#"
//               className={`text-sm font-medium transition-colors ${
//                 item === 'Monitoring'
//                   ? 'text-accent-blue'
//                   : 'text-gray-400 hover:text-white'
//               }`}
//             >
//               {item}
//             </a>
//           ))}
//         </nav>

//         {/* Right side */}
//         <div className="flex items-center space-x-4">
//           <button className="text-gray-400 hover:text-white transition-colors">
//             <Bell size={20} />
//           </button>
//           <button className="text-gray-400 hover:text-white transition-colors">
//             <LogOut size={20} />
//             <span className="ml-2 text-sm">Logout</span>
//           </button>
//           <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
//             <User size={16} className="text-gray-300" />
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Header







import React from 'react'
import { Bell, LogOut, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation and useNavigate
import logo from '../assets/logo.jpg'; // Assuming your logo is here

const Header = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Get current location to dynamically set active tab
  const navItems = ['Dashboard', 'Interview Room', 'Admin Panel', 'Monitoring'];

  const handleLogout = () => {
    localStorage.removeItem("userToken"); // Clear the token
    localStorage.removeItem("userName");  // Clear user name
    localStorage.removeItem("userEmail"); // Clear user email
    navigate("/login"); // Redirect to the login page
  };

  return (
    <header className="bg-dark-card border-b border-border-color px-6 py-4 flex items-center justify-between"> {/* Adjusted background and border color for consistency */}
      {/* Left side: Logo and Navigation Tabs */}
      <div className="flex items-center space-x-8">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="InTouch Logo" className="w-11 h-11 object-contain rounded-lg" /> {/* Logo added */}
          <span className="text-white font-bold text-lg">InTouch</span> {/* Brand name added */}
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
              } // Use actual paths for navigation
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                location.pathname === ( // Set active state based on currentPath matching the item's implied path
                  item === 'Dashboard' ? '/dashboard' :
                  item === 'Interview Room' ? '/interview' :
                  item === 'Admin Panel' ? '/admin' :
                  item === 'Monitoring' ? '/monitoring' : '#'
                )
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' // Active state with underline
                  : 'text-gray-text hover:text-white' // Using gray-text from tailwind.config
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-text hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        {/* Apply the handleLogout function to this button */}
        <button
          onClick={handleLogout} // Assign the logout handler here
          className="flex items-center space-x-2 text-gray-text hover:text-white transition-colors"
        >
          <span className="text-sm">Logout</span>
          <LogOut size={16} />
        </button>
        {/* Profile picture/icon - assuming this is for the logged-in user */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User size={16} className="text-white" /> {/* Use User icon */}
        </div>
      </div>
    </header>
  )
}

export default Header