import React, { useState } from 'react';

const CodeEditor2 = () => {
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
// Expected: 55`);

  return (
    <div className="h-full flex flex-col bg-dark-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border-color">
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium rounded-t-lg bg-indigo-600 text-white">
            Code Editor
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-t-lg text-gray-400 hover:text-white">
            Whiteboard
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* Placeholder for a code editor */}
        <textarea
          className="w-full h-full bg-gray-900 text-white font-mono text-sm p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          style={{ resize: 'none' }}
        />
      </div>
    </div>
  );
};

export default CodeEditor2;