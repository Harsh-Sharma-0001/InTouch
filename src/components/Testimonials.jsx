// import React from 'react'

// const Testimonials = () => {
//   const testimonials = [
//     {
//       quote: "InTouch has revolutionized our hiring process. The collaborative code editor and anti-cheating features give us complete confidence.",
//       author: "Aman Kuntal",
//       position: "CTO, Tech Solutions Inc."
//     },
//     {
//       quote: "The video conferencing and whiteboard tools are incredibly intuitive. It feels like we're in the same room, even remotely.",
//       author: "Shrey Mehrotra",
//       position: "Tech Recruiter, Global Innovations"
//     },
//     {
//       quote: "Scheduling interviews is a breeze, and the monitoring view is a game-changer for maintaining integrity. Highly recommend!",
//       author: "Aryan Gupta",
//       position: "HR Manager, Future Systems"
//     }
//   ]

//   return (
//     <section className="bg-gray-800 py-20">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             What Our Users Say
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Hear directly from the professionals who trust InTouch for their most critical
//             interviews.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {testimonials.map((testimonial, index) => (
//             <div key={index} className="bg-gray-700 p-6 rounded-lg">
//               <p className="text-gray-300 mb-6 italic">
//                 "{testimonial.quote}"
//               </p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mr-4">
//                   <span className="text-white font-semibold">
//                     {testimonial.author.split(' ').map(n => n[0]).join('')}
//                   </span>
//                 </div>
//                 <div>
//                   <div className="text-white font-semibold">
//                     {testimonial.author}
//                   </div>
//                   <div className="text-gray-400 text-sm">
//                     {testimonial.position}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// export default Testimonials

import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "InTouch has revolutionized our hiring process. The collaborative code editor and anti-cheating features give us complete confidence.",
      author: "Aman Kuntal", // Changed author name as per screenshot
      position: "CTO, Tech Solutions Inc.",
    },
    {
      quote:
        "The video conferencing and whiteboard tools are incredibly intuitive. It feels like we're in the same room, even remotely.",
      author: "Shrey Mehrotra", // Changed author name as per screenshot
      position: "Tech Recruiter, Global Innovations",
    },
    {
      quote:
        "Scheduling interviews is a breeze, and the monitoring view is a game-changer for maintaining integrity. Highly recommend!",
      author: "Kartikey Verma", // Changed author name as per screenshot
      position: "HR Manager, Future Systems",
    },
  ];

  return (
    <section className="bg-gray-900 py-20">
      {" "}
      {/* Adjusted background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {" "}
            {/* Adjusted text color */}
            Hear directly from the professionals who trust InTouch for their
            most critical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-dark-card p-6 rounded-lg border border-gray-700"
            >
              {" "}
              {/* Adjusted card background and border */}
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                {/* Profile picture/initials from screenshot */}
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  {/* Using a placeholder for profile images, ideally you'd have actual images */}
                  {index === 0 && (
                    <img
                      src="https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFufGVufDB8fDB8fHww"
                      alt="Aman Kuntal"
                      className="w-full h-full object-cover"
                    />
                  )}{" "}
                  {/* Placeholder for Jane Doe's image */}
                  {index === 1 && (
                    <img
                      src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww"
                      alt="Shrey Mehrotra"
                      className="w-full h-full object-cover"
                    />
                  )}{" "}
                  {/* Placeholder for John Smith's image */}
                  {index === 2 && (
                    <img
                      src="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFufGVufDB8fDB8fHww"
                      alt="Kartikey Verma"
                      className="w-full h-full object-cover"
                    />
                  )}{" "}
                  {/* Placeholder for Alice Johnson's image */}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {testimonial.position}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
