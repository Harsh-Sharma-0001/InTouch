
// import React from 'react';
// import { useAuth0 } from '@auth0/auth0-react';
// import logo from '../assets/logo.jpg';


// const Header = () => {
//   const {
//     loginWithRedirect,
//     logout,
//     isAuthenticated,
//     user,
//     isLoading,
//   } = useAuth0();

//   return (
//     <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-3">
//             <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
//             <span className="text-white font-semibold text-xl">InTouch</span>
//           </div>

//           {/* Navigation Buttons */}
//           <div className="flex items-center space-x-4">
//             {!isLoading && isAuthenticated ? (
//               <>
//                 <span className="text-white text-sm hidden sm:block">
//                   Welcome, {user.name}
//                 </span>
//                 <button
//                   onClick={() =>
//                     logout({ returnTo: window.location.origin })
//                   }
//                   className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition duration-200"
//                 >
//                   Log Out
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() =>
//                     loginWithRedirect({
//                       appState: { returnTo: '/dashboard' },
//                     })
//                   }
//                   className="text-white font-semibold hover:text-blue-500 px-4 py-2 rounded-md transition duration-200"
//                 >
//                   Log In
//                 </button>
//                 <button
//                   onClick={() =>
//                     loginWithRedirect({
//                       screen_hint: 'signup',
//                       appState: { returnTo: '/dashboard' },
//                     })
//                   }
//                   className="bg-blue-600 font-semibold hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow transition duration-200"
//                 >
//                   Sign Up
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;




// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import logo from '../assets/logo.jpg';

// const Header = () => {
//   const navigate = useNavigate();

//   return (
//     <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center space-x-3">
//             <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
//             <span className="text-white font-semibold text-xl">InTouch</span>
//           </div>

//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => navigate('/login')}
//               className="text-white font-semibold hover:text-blue-500 px-4 py-2 rounded-md transition duration-200"
//             >
//               Log In
//             </button>
//             <button
//               onClick={() => navigate('/signup')}
//               className="bg-blue-600 font-semibold hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow transition duration-200"
//             >
//               Sign Up
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;







import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Assuming your logo is here

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-dark-header border-b border-dark-border shadow-sm"> {/* Changed to match dark theme from screenshots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="InTouch Logo" className="w-11 h-11 object-contain rounded-lg" />
            <span className="text-white font-semibold text-xl">InTouch</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-white hover:text-blue-400 px-4 py-2 rounded-md shadow transition duration-200 uppercase text-sm" // Adjusted text and styling
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup-choice')}
              className=" font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition duration-200 uppercase text-sm" // Adjusted text and styling
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;