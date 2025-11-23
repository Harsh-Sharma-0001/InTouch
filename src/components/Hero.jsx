// import React from "react";

// const Hero = () => {
//   return (
    // <section className="bg-[url('https://cdn.gamma.app/uo8ak21io5wx1j8/generated-images/R9aYmjDjstnzllgLZYwCk.jpg')] bg-cover bg-center h-screen relative bg-gray-400 py-20 lg:py-32">
    //   {/* Background Image Overlay */}
    //   <div className="absolute inset-0 bg-black bg-opacity-50"></div>

    //   {/* Hero Image - Using a placeholder that represents the collaborative coding scene */}
    //   <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-80"></div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
//           Transform Your Tech Hiring
//         </h1>

//         <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
//           Seamlessly conduct remote technical interviews with real-time
//           collaborative coding, video conferencing, and advanced monitoring.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button className="border border-white-400 bg-primary-500 hover:bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors">
//             Get Started
//           </button>
//           <button className="border border-white-400 bg-primary-500 hover:bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors">
//             Learn More
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;







// import React from "react";

// const Hero = () => {
  // return (
    // <section className="bg-[url('https://cdn.gamma.app/uo8ak21io5wx1j8/generated-images/R9aYmjDjstnzllgLZYwCk.jpg')] bg-cover bg-center h-screen relative bg-gray-400 py-20 lg:py-32">
    //   {/* Background Image Overlay */}
    //   <div className="absolute inset-0 bg-black bg-opacity-50"></div>

    //   {/* Hero Image - Using a placeholder that represents the collaborative coding scene */}
    //   <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-80"></div>

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
//         <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
//           Transform Your Tech Hiring
//         </h1>

//         <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
//           Seamlessly conduct remote technical interviews with real-time
//           collaborative coding, video conferencing, and advanced monitoring.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button className="bg-blue-700 text-bold hover:bg-blue-800 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"> {/* Updated button styling */}
//             Get Started
//           </button>
//           <button className="text-white bg-black hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"> {/* Updated button styling */}
//             Learn More
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;







import React from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const Hero = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
       <section className="bg-[url('https://cdn.gamma.app/uo8ak21io5wx1j8/generated-images/R9aYmjDjstnzllgLZYwCk.jpg')] bg-cover bg-center h-screen relative bg-gray-400 py-20 lg:py-32">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Hero Image - Using a placeholder that represents the collaborative coding scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-80"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Transform Your Tech Hiring
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
          Seamlessly conduct remote technical interviews with real-time
          collaborative coding, video conferencing, and advanced monitoring.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/signup-choice')} // Add onClick to redirect to /signup-choice
            className="bg-blue-700 text-bold hover:bg-blue-800 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate('/learn-more')} // Add onClick to redirect to /learn-more
            className="text-white bg-black hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;