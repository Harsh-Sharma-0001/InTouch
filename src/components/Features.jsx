// import React from 'react'

// const Features = () => {
//   const features = [
//     {
//       icon: "💻",
//       title: "Real-time Code Editor",
//       description: "Collaborate with candidates in real-time with our advanced code editor supporting multiple languages."
//     },
//     {
//       icon: "📹",
//       title: "Integrated Video Conferencing",
//       description: "Seamless video calls integrated directly into the interview platform for better communication."
//     },
//     {
//       icon: "📝",
//       title: "Digital Whiteboard",
//       description: "Visualize complex problems and solutions with an interactive whiteboard for technical discussions."
//     },
//     {
//       icon: "💬",
//       title: "Instant Chat",
//       description: "Communicate efficiently with candidates via an integrated chat system during interviews."
//     },
//     {
//       icon: "🛡️",
//       title: "Advanced Anti-Cheating Monitoring",
//       description: "Ensure interview integrity with advanced monitoring, recording, and anti-cheating measures."
//     },
//     {
//       icon: "📅",
//       title: "Seamless Scheduling",
//       description: "Easily schedule and manage interviews with integrated calendar and automated reminders."
//     }
//   ]

//   return (
//     <section className="bg-gray-800 py-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             Why Choose InTouch?
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Experience the future of technical interviews with a platform designed for
//             precision, collaboration, and peace of mind.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <div key={index} className="bg-gray-700 p-6 rounded-lg hover:bg-gray-600 transition-colors">
//               <div className="text-4xl mb-4">{feature.icon}</div>
//               <h3 className="text-xl font-semibold text-white mb-3">
//                 {feature.title}
//               </h3>
//               <p className="text-gray-300">
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default Features







import React from 'react';

const Features = () => {
  const features = [
    {
      icon: "💻",
      title: "Real-time Code Editor",
      description: "Collaborate with candidates in real-time with our advanced code editor supporting multiple languages."
    },
    {
      icon: "📹",
      title: "Integrated Video Conferencing",
      description: "Seamless video calls integrated directly into the interview platform for better communication."
    },
    {
      icon: "📝",
      title: "Digital Whiteboard",
      description: "Visualize complex problems and solutions with an interactive whiteboard for technical discussions."
    },
    {
      icon: "💬",
      title: "Instant Chat",
      description: "Communicate efficiently with candidates via an integrated chat system during interviews."
    },
    {
      icon: "🛡️",
      title: "Advanced Anti-Cheating Monitoring",
      description: "Ensure interview integrity with advanced monitoring, recording, and anti-cheating measures."
    },
    {
      icon: "📅",
      title: "Seamless Scheduling",
      description: "Easily schedule and manage interviews with integrated calendar and automated reminders."
    }
  ];

  return (
    <section className="bg-gray-900 py-20"> {/* Background matches screenshot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose InTouch?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto"> {/* Adjusted text color */}
            Experience the future of technical interviews with a platform designed for
            precision, collaboration, and peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-dark-card p-6 rounded-lg hover:bg-gray-700 transition-colors"> {/* Adjusted card background */}
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400"> {/* Adjusted text color */}
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;