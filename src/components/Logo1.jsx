import React from 'react'

const Logo1 = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Logo icon - geometric shapes representing the brand */}
      {/* <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-purple-light to-brand-purple rounded-lg transform rotate-12 opacity-80"></div>
        <div className="absolute -top-1 -left-1 w-12 h-12 bg-gradient-to-br from-brand-purple to-indigo-600 rounded-lg transform -rotate-12"></div>
      </div> */}
      
      {/* Brand name */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">InTouch</h1>
      </div>
    </div>
  )
}

export default Logo1
