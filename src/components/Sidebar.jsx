// import React from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import { BarChart3, Calendar, Monitor, Settings, User } from "lucide-react";
// import logo from '../assets/logo.jpg';

// const Sidebar = ({ role = "user" }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const logout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const menuItems = [
//     { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
//     { label: "Interview Room", path: "/interview", icon: Calendar },
//     { label: "Monitoring", path: "/monitoring", icon: Monitor },
//     { label: "Admin Panel", path: "/admin", icon: Settings },
//   ];

//   return (
//     <aside className="w-64 bg-dark-card h-screen flex flex-col justify-between">
//       <div>
//         {/* Logo */}
//         <div className="flex items-center space-x-3">
//           <img src={logo} alt="Logo" className="m-3 w-10 h-10 object-contain" />
//           <span className="text-white font-bold text-xl">InTouch</span>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-4 space-y-2 px-2">
//           {menuItems.map(({ label, path, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <Link
//                 key={path}
//                 to={path}
//                 className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-primary text-white"
//                     : "text-text-gray hover:text-white hover:bg-dark-card"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Footer */}
//       <div className="p-6 space-y-4">
        // <button
        //   onClick={logout}
        //   className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        // >
        //   Logout
        // </button>

//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
//             <User size={16} />
//           </div>
//           <div>
//             <div className="text-sm font-medium text-white">Harsh Sharma</div>
//             <div className="text-xs text-text-gray capitalize">{role}</div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };
// export default Sidebar;





// import React from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom";
// import { BarChart3, Calendar, Monitor, Settings, User, Bell } from "lucide-react"; // Import Bell
// import logo from '../assets/logo.jpg'; // Assuming you have a logo.png

// const Sidebar = ({ role = "user" }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//    const logout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const menuItems = [
//     { label: "Dashboard", path: "/dashboard", icon: BarChart3, category: "Interview Panel" },
//     { label: "Interview Room", path: "/interview", icon: Calendar, category: "Interview Panel" },
//     { label: "Monitoring", path: "/monitoring", icon: Monitor, category: "Interview Panel" },
//     { label: "Admin Panel", path: "/admin", icon: Settings, category: "Admin Panel" },
//   ];

//   return (
//     <aside className="w-64 bg-dark-card h-screen flex flex-col pt-6 pb-4 px-4 border-r border-border-color"> {/* Added padding and border */}
//       <div className="flex items-center space-x-3 mb-6 px-2"> {/* Adjusted margin and padding */}
//         <img src={logo} alt="Logo" className="w-8 h-8 object-contain" /> {/* Adjusted size */}
//         <span className="text-white font-bold text-xl">InTouch</span>
//       </div>

//       {/* Profile Info (Moved from header to sidebar top as per screenshot) */}
//       <div className="flex items-center space-x-3 mb-6 px-2">
//         <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
//           JD {/* Initials of John Doe */}
//         </div>
//         <div className="flex-1">
//           <div className="text-base font-medium text-white">John Doe</div>
//           <div className="text-sm text-gray-text">john.doe@intouch.com</div>
//         </div>
//         <button className="text-gray-text hover:text-white">
//           <Bell size={18} />
//         </button>
//       </div>

//       {/* Navigation - Interview Panel */}
//       <div className="mb-6">
//         <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Interview Panel</div>
//         <nav className="space-y-2">
//           {menuItems.filter(item => item.category === "Interview Panel").map(({ label, path, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <Link
//                 key={path}
//                 to={path}
//                 className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-primary text-white"
//                     : "text-gray-text hover:text-white hover:bg-dark-lighter"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Navigation - Admin Panel */}
//       <div className="mb-auto"> {/* Push admin panel to top of remaining space */}
//         <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Admin Panel</div>
//         <nav className="space-y-2">
//           {menuItems.filter(item => item.category === "Admin Panel").map(({ label, path, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <Link
//                 key={path}
//                 to={path}
//                 className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-primary text-white"
//                     : "text-gray-text hover:text-white hover:bg-dark-lighter"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Logout button (at the very bottom as per screenshot) */}
//       <div className="mt-8">
//         <button
//           onClick={logout}
//           className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
//         >
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };
// export default Sidebar;







// import React from "react";
// import { useLocation, useNavigate, Link } from "react-router-dom"; // Keep useNavigate if used elsewhere, but not for logout here
// import { BarChart3, Calendar, Monitor, Settings, User, Bell } from "lucide-react";
// import logo from '../assets/logo.jpg';

// const Sidebar = ({ role = "user" }) => {
//   const location = useLocation();
//   // const navigate = useNavigate(); // No longer needed here if only for logout

//   // REMOVE THE LOGOUT FUNCTION FROM HERE
//   // const logout = () => {
//   //   localStorage.removeItem("user");
//   //   navigate("/login");
//   // };

//   const menuItems = [
//     { label: "Dashboard", path: "/dashboard", icon: BarChart3, category: "Interview Panel" },
//     { label: "Interview Room", path: "/interview", icon: Calendar, category: "Interview Panel" },
//     { label: "Monitoring", path: "/monitoring", icon: Monitor, category: "Interview Panel" },
//     { label: "Admin Panel", path: "/admin", icon: Settings, category: "Admin Panel" },
//   ];

//   return (
//     <aside className="w-64 bg-dark-card h-screen flex flex-col pt-6 pb-4 px-4 border-r border-border-color">
//       <div className="flex items-center space-x-3 mb-6 px-2">
//         <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
//         <span className="text-white font-bold text-xl">InTouch</span>
//       </div>

//       {/* Profile Info (Moved from header to sidebar top as per screenshot) */}
//       <div className="flex items-center space-x-3 mb-6 px-2">
//         <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
//           JD {/* Initials of John Doe */}
//         </div>
//         <div className="flex-1">
//           <div className="text-base font-medium text-white">John Doe</div>
//           <div className="text-sm text-gray-text">john.doe@intouch.com</div>
//         </div>
//         <button className="text-gray-text hover:text-white">
//           <Bell size={18} />
//         </button>
//       </div>

//       {/* Navigation - Interview Panel */}
//       <div className="mb-6">
//         <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Interview Panel</div>
//         <nav className="space-y-2">
//           {menuItems.filter(item => item.category === "Interview Panel").map(({ label, path, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <Link
//                 key={path}
//                 to={path}
//                 className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-primary text-white"
//                     : "text-gray-text hover:text-white hover:bg-dark-lighter"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* Navigation - Admin Panel */}
//       <div className="mb-auto">
//         <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Admin Panel</div>
//         <nav className="space-y-2">
//           {menuItems.filter(item => item.category === "Admin Panel").map(({ label, path, icon: Icon }) => {
//             const isActive = location.pathname === path;
//             return (
//               <Link
//                 key={path}
//                 to={path}
//                 className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-primary text-white"
//                     : "text-gray-text hover:text-white hover:bg-dark-lighter"
//                 }`}
//               >
//                 <Icon size={20} />
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* REMOVE THE LOGOUT BUTTON DIV FROM HERE */}
//       {/*
//       <div className="mt-8">
//         <button
//           onClick={logout}
//           className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
//         >
//           Logout
//         </button>
//       </div>
//       */}
//     </aside>
//   );
// };
// export default Sidebar;







import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { useLocation, useNavigate, Link } from "react-router-dom";
import { BarChart3, Calendar, Monitor, Settings, User, Bell, LogOut } from "lucide-react"; // Added LogOut icon
import logo from '../assets/logo.jpg';
import { API_URL } from '../utils/config.js';

const Sidebar = ({ role = "user" }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Now needed for logout functionality

  const [userName, setUserName] = useState('John Doe'); // Default or placeholder
  const [userEmail, setUserEmail] = useState('john.doe@intouch.com'); // Default or placeholder
  const [userInitials, setUserInitials] = useState('JD'); // For the avatar
  const [isAdmin, setIsAdmin] = useState(false); // Admin status

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

    if (storedUserName) {
      setUserName(storedUserName);
      // Generate initials from username
      // This logic assumes username is like "First Last"
      const initials = storedUserName.split(' ').map(n => n[0]).join('').toUpperCase();
      setUserInitials(initials);
    }
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
    setIsAdmin(storedIsAdmin);

    // Also verify admin status from server if token exists
    const token = localStorage.getItem('token');
    if (token) {
      verifyAdminStatus();
    }
  }, []); // Empty dependency array means this runs once on component mount

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

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    localStorage.removeItem('userToken'); // Clear the token (legacy)
    localStorage.removeItem('userName');  // Clear user name
    localStorage.removeItem('userEmail'); // Clear user email
    localStorage.removeItem('isAdmin'); // Clear admin status
    localStorage.removeItem('user'); // Clear user object
    navigate('/login'); // Redirect to login page
  };


  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: BarChart3, category: "Interview Panel" },
    { label: "Interview Room", path: "/interview", icon: Calendar, category: "Interview Panel" },
    { label: "Monitoring", path: "/monitoring", icon: Monitor, category: "Interview Panel" },
    { label: "Admin Panel", path: "/admin", icon: Settings, category: "Admin Panel" },
  ];

  return (
    <aside className="w-64 bg-dark-card h-screen flex flex-col pt-6 pb-4 px-4 border-r border-border-color">
      {/* Top Logo Section */}
      <div 
        className="flex items-center space-x-3 mb-6 px-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="Logo" className="w-11 h-11 object-contain rounded-lg" />
        <span className="text-white font-bold text-xl">InTouch</span>
      </div>

      {/* Navigation - Interview Panel (Now the first navigation block) */}
      <div className="mb-6"> {/* Removed mb-auto here */}
        <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Interview Panel</div>
        <nav className="space-y-2">
          {menuItems.filter(item => item.category === "Interview Panel").map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-text hover:text-white hover:bg-dark-lighter"
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Navigation - Admin Panel (Only show if user is admin) */}
      {isAdmin && (
        <div className="mb-auto"> {/* Added mb-auto here to push below content to the bottom */}
          <div className="text-xs text-gray-text uppercase font-semibold mb-2 px-4">Admin Panel</div>
          <nav className="space-y-2">
            {menuItems.filter(item => item.category === "Admin Panel").map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-text hover:text-white hover:bg-dark-lighter"
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Profile Info and Logout (New Footer Section) */}
      <div className="mt-auto pt-4 border-t border-border-color"> {/* mt-auto pushes it to the bottom */}
        <div className="flex items-center space-x-3 px-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {userInitials} {/* Display dynamically generated initials */}
          </div>
          <div className="flex-1">
            <div className="text-base font-medium text-white">{userName}</div> {/* Display dynamic username */}
            <div className="text-sm text-gray-text">{userEmail}</div> {/* Display dynamic user email */}
          </div>
        </div>
        {/* Logout Button removed */}
      </div>
    </aside>
  );
};

export default Sidebar;
