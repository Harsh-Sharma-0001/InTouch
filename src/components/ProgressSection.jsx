// import React from 'react'
// import { TrendingUp } from 'lucide-react'

// const ProgressSection = () => {
//   return (
//     <div className="bg-dark-card rounded-lg p-6 border border-gray-700 shadow-sm text-white ">
//       <h2 className="text-xl font-semibold text-white mb-6">Overall Interview Progress</h2>
      
//       <div className="flex items-center justify-center mb-6">
//         <div className="text-center">
//           <div className="flex items-center justify-center mb-4">
//             <TrendingUp className="text-primary" size={32} />
//           </div>
//           <div className="text-5xl font-bold text-white mb-2">85%</div>
//           <div className="text-gray-text text-sm">Target Completion Rate</div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="mb-4">
//         <div className="w-full bg-dark-lighter rounded-full h-2">
//           <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
//         </div>
//       </div>

//       <div className="text-center text-sm text-gray-text">
//         85% of interviews completed this quarter
//       </div>
//     </div>
//   )
// }

// export default ProgressSection





import React from 'react'
import { TrendingUp } from 'lucide-react'

const ProgressSection = () => {
  return (
    <div className="bg-dark-card rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Overall Interview Progress</h2>

      <div className="flex items-center justify-center mb-6 relative">
        {/* Circular Progress Bar (SVG for more control) */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-dark-lighter"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary"
              strokeWidth="10"
              strokeDasharray="251.2" 
              strokeDashoffset="62.8" 
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <TrendingUp className="text-primary mb-2" size={32} />
            <div className="text-4xl font-bold text-white">85%</div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-text text-sm">
        Target Completion Rate
      </div>

      {/* Progress Bar (bottom part as in screenshot) */}
      <div className="mt-8 mb-4">
        <div className="w-full bg-dark-lighter rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-text">
        85% of interviews completed this quarter
      </div>
    </div>
  )
}

export default ProgressSection;