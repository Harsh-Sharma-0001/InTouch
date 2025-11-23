// import React from "react";

// const CTA = () => {
//   return (
//     <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//           Ready to Elevate Your Hiring?
//         </h2>
//         <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90">
//           Join leading tech companies that trust InTouch for secure, efficient,
//           and insightful remote interviews.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <button className="bg-white text-purple-600 hover:bg-transparent hover:text-white hover:border-2 px-8 py-3 rounded-md text-lg font-semibold transition-colors">
//             Sign Up for Free
//           </button>
//           <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-md text-lg font-semibold transition-colors">
//             Request a Demo
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CTA;





import React from "react";
import { useNavigate } from 'react-router-dom';


const CTA = () => {

  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-purple-600 to-pink-500 py-20">
      {" "}
      {/* Adjusted gradient */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Elevate Your Hiring?
        </h2>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90">
          Join leading tech companies that trust InTouch for secure, efficient,
          and insightful remote interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/signup-choice")}
            className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"
          >
            {" "}
            {/* Adjusted button styling */}
            Sign Up for Free
          </button>
          <button
            onClick={() => navigate("/request-demo")}
            className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 rounded-md text-lg font-semibold transition-colors shadow-lg"
          >
            {" "}
            {/* Adjusted button styling */}
            Request a Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
