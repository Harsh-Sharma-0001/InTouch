// import React from "react";

// const HowItWorks = () => {
//   const steps = [
//     {
//       number: "1",
//       title: "Schedule Your Interview",
//       description:
//         "Use our intuitive calendar to set up interviews and send invites instantly.",
//     },
//     {
//       number: "2",
//       title: "Conduct with Confidence",
//       description:
//         "Engage candidates in a seamless environment with live coding, video, and chat.",
//     },
//     {
//       number: "3",
//       title: "Review & Analyze",
//       description:
//         "Access recordings, code submissions, and analytics to make informed hiring decisions.",
//     },
//   ];

//   return (
//     <section className="bg-gray-900 py-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             How InTouch Works
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Our streamlined process ensures a smooth and effective interview
//             experience for everyone.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {steps.map((step, index) => (
//             <div
//               key={index}
//               className="text-center border border-white-400 bg-primary-500 hover:bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-semibold transition-colors"
//             >
//               <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <span className="text-white text-2xl font-bold">
//                   {step.number}
//                 </span>
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-4">
//                 {step.title}
//               </h3>
//               <p className="text-gray-300">{step.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HowItWorks;






// import React from "react";

// const HowItWorks = () => {
//   const steps = [
//     {
//       number: "1",
//       title: "Schedule Your Interview",
//       description:
//         "Use our intuitive calendar to set up interviews and send invites instantly.",
//     },
//     {
//       number: "2",
//       title: "Conduct with Confidence",
//       description:
//         "Engage candidates in a seamless environment with live coding, video, and chat.",
//     },
//     {
//       number: "3",
//       title: "Review & Analyze",
//       description:
//         "Access recordings, code submissions, and analytics to make informed hiring decisions.",
//     },
//   ];

//   return (
//     <section className="bg-gray-800 py-20"> {/* Adjusted background */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             How InTouch Works
//           </h2>
//           <p className="text-xl text-gray-400 max-w-3xl mx-auto"> {/* Adjusted text color */}
//             Our streamlined process ensures a smooth and effective interview
//             experience for everyone.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {steps.map((step, index) => (
//             <div
//               key={index}
//               className="text-center bg-dark-card p-6 rounded-lg border border-gray-700" // Adjusted card background and border
//             >
//               <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"> {/* Adjusted circle background */}
//                 <span className="text-white text-2xl font-bold">
//                   {step.number}
//                 </span>
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-4">
//                 {step.title}
//               </h3>
//               <p className="text-gray-400">{step.description}</p> {/* Adjusted text color */}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HowItWorks;







import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      imageUrl: "http://t1.gstatic.com/images?q=tbn:ANd9GcR9CbRyiY-3V_RGVoBX-jn4og65m0cF8zv1rKhX-kswV-fX6keL4IUWXFxe_IOGqrfaJYLVm-JY", // Step 1
      title: "Schedule Your Interview",
      description:
        "Use our intuitive calendar to set up interviews and send invites instantly.",
    },
    {
      imageUrl: "http://t1.gstatic.com/images?q=tbn:ANd9GcSSzb0iIm7J75fPObY9EJN8UwBc9Jq8Ve0bWwL9Fx-pkCYU2L0gr0BYxFbREvRXD6aRA6abIQfp", // Step 2
      title: "Conduct with Confidence",
      description:
        "Engage candidates in a seamless environment with live coding, video, and chat.",
    },
    {
      imageUrl: "http://t2.gstatic.com/images?q=tbn:ANd9GcRsGcuI-mlKSEUjOHS98IgVy2sUGqz_infpgBhLTFu9Xh49Ls0yGFuf2VOVLLNuB__f9yfm1bph", // Step 3
      title: "Review & Analyze",
      description:
        "Access recordings, code submissions, and analytics to make informed hiring decisions.",
    },
  ];

  return (
    <section className="bg-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How InTouch Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our streamlined process ensures a smooth and effective interview
            experience for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center bg-dark-card p-6 rounded-lg border border-gray-700"
            >
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
                <img
                  src={step.imageUrl}
                  alt={`Step ${index + 1}`}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
