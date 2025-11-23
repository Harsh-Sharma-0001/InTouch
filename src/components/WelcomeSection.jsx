// import React from 'react'

// const WelcomeSection = () => {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-white mb-2">
//         Welcome, Harsh Sharma! 👋
//       </h1>
//       <p className="text-gray-text">
//         Here's an overview of your interview activities today.
//       </p>
//     </div>
//   )
// }

// export default WelcomeSection



// import React from 'react'

// const WelcomeSection = () => {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-white mb-2">
//         Welcome, John Doe! 👋
//       </h1>
//       <p className="text-gray-text">
//         Here's an overview of your interview activities today.
//       </p>
//     </div>
//   )
// }

// export default WelcomeSection





import React, { useState, useEffect } from 'react';

const WelcomeSection = () => {
  const [userName, setUserName] = useState('Guest'); // Default to 'Guest'
  // const [userEmail, setUserEmail] = useState(''); // Not used in WelcomeSection, but good for consistency

  useEffect(() => {
    // Retrieve username from localStorage
    const storedUserName = localStorage.getItem('userName'); // Or parse a user object if stored differently
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome, {userName}! 👋
      </h1>
      <p className="text-gray-text">
        Here's an overview of your interview activities today.
      </p>
    </div>
  );
};

export default WelcomeSection;