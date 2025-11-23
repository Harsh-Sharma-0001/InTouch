import React from "react";

const Logo = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Logo Icon - Abstract geometric shape */}
      {/* <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-purple-light to-brand-purple rounded-lg transform rotate-12 opacity-80"></div>
        <div className="absolute -top-1 -left-1 w-12 h-12 bg-gradient-to-br from-brand-purple to-indigo-600 rounded-lg transform -rotate-12"></div>
      </div> */}

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 text-base">
          To continue connecting with your
          opportunities.
        </p>
      </div>
    </div>
  );
};

export default Logo;
