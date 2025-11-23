import React from 'react'

const NetworkBackground = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated network lines background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Network nodes */}
          <circle cx="100" cy="100" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="200" cy="150" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="300" cy="80" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="400" cy="200" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="500" cy="120" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="600" cy="180" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="150" cy="250" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="350" cy="300" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="550" cy="280" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="250" cy="400" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="450" cy="380" r="3" fill="rgba(255,255,255,0.6)" />
          <circle cx="650" cy="350" r="3" fill="rgba(255,255,255,0.6)" />
          
          {/* Glowing connection lines */}
          <g stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none">
            <line x1="100" y1="100" x2="200" y2="150" />
            <line x1="200" y1="150" x2="300" y2="80" />
            <line x1="300" y1="80" x2="500" y2="120" />
            <line x1="400" y1="200" x2="600" y2="180" />
            <line x1="150" y1="250" x2="350" y2="300" />
            <line x1="350" y1="300" x2="550" y2="280" />
            <line x1="250" y1="400" x2="450" y2="380" />
            <line x1="450" y1="380" x2="650" y2="350" />
            <line x1="100" y1="100" x2="150" y2="250" />
            <line x1="500" y1="120" x2="550" y2="280" />
          </g>
          
          {/* Bright energy lines */}
          <g stroke="rgba(255,215,0,0.8)" strokeWidth="2" fill="none">
            <path d="M 50 300 Q 200 250 350 300 T 650 280" />
            <path d="M 100 450 Q 300 400 500 450 T 750 420" />
            <path d="M 150 200 Q 350 150 550 200" />
          </g>
          
          {/* Glowing orbs */}
          <circle cx="200" cy="300" r="8" fill="rgba(255,215,0,0.3)" />
          <circle cx="500" cy="250" r="6" fill="rgba(255,255,255,0.4)" />
          <circle cx="400" cy="350" r="10" fill="rgba(255,215,0,0.2)" />
        </svg>
      </div>
      
      {/* Overlay gradient for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent"></div>
    </div>
  )
}

export default NetworkBackground
