// import React, { useState } from 'react'
// import { Send } from 'lucide-react'

// const ChatPanel = () => {
//   const [message, setMessage] = useState('')
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       user: 'Hariom Tiwari',
//       time: '1:12 PM',
//       message: 'The current solution needs optimization for large datasets. Perhaps a different algorithm could improve performance.',
//       avatar: 'DC',
//       bgColor: 'bg-purple-500'
//     },
//     {
//       id: 2,
//       user: 'Prakhar Patel',
//       time: '1:15 PM',
//       message: 'Agreed. I\'m thinking about a divide and conquer approach, especially for the sorting phase.',
//       avatar: 'JN',
//       bgColor: 'bg-orange-500'
//     },
//     {
//       id: 3,
//       user: 'Abhishek Rajput',
//       time: '1:18 PM',
//       message: '👍 👍 👍 Great idea! Let\'s sketch that out on the whiteboard.',
//       avatar: 'BC',
//       bgColor: 'bg-blue-500'
//     },
//     {
//       id: 4,
//       user: 'You',
//       time: '1:20 PM',
//       message: 'Sounds good. I can start drawing the flow.',
//       avatar: 'You',
//       bgColor: 'bg-primary',
//       isUser: true
//     }
//   ])

//   const handleSendMessage = (e) => {
//     e.preventDefault()
//     if (message.trim()) {
//       const newMessage = {
//         id: messages.length + 1,
//         user: 'You',
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         message: message,
//         avatar: 'You',
//         bgColor: 'bg-primary',
//         isUser: true
//       }
//       setMessages([...messages, newMessage])
//       setMessage('')
//     }
//   }

//   return (
//     <div className="bg-dark-card rounded-lg flex flex-col h-80">
//       <div className="p-4 border-b border-gray-600">
//         <h3 className="text-white font-medium">Chat</h3>
//       </div>
      
//       <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
//         {messages.map((msg) => (
//           <div key={msg.id} className="flex space-x-3">
//             <div className={`w-8 h-8 ${msg.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
//               <span className="text-white text-xs font-medium">
//                 {msg.isUser ? '👤' : msg.avatar}
//               </span>
//             </div>
            
//             <div className="flex-1">
//               <div className="flex items-center space-x-2 mb-1">
//                 <span className="text-white text-sm font-medium">{msg.user}</span>
//                 <span className="text-gray-400 text-xs">{msg.time}</span>
//               </div>
//               <div className={`text-sm p-3 rounded-lg ${
//                 msg.isUser 
//                   ? 'bg-primary text-white ml-4' 
//                   : 'bg-gray-700 text-gray-200'
//               }`}>
//                 {msg.message}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
      
//       <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-600">
//         <div className="flex items-center space-x-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Add a comment..."
//             className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//           <button
//             type="submit"
//             className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition-colors"
//           >
//             <Send size={16} />
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ChatPanel








import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Prakhar Patel', // Changed user as per screenshot
      time: '1:12 PM',
      message: 'The current solution needs optimization for large datasets. Perhaps a different algorithm could improve performance.',
      avatar: 'PP',
      bgColor: 'bg-green-500' // Adjusted color
    },
    {
      id: 2,
      user: 'Abhishek Rajput', // Changed user as per screenshot
      time: '1:15 PM',
      message: 'Agreed. I\'m thinking about a divide and conquer approach, especially for the sorting phase.',
      avatar: 'AR',
      bgColor: 'bg-purple-500' // Adjusted color
    },
    {
      id: 3,
      user: 'Sundar Pichai', // Changed user as per screenshot
      time: '1:18 PM',
      message: '👍 👍 👍 Great idea! Let\'s sketch that out on the whiteboard.',
      avatar: 'SP',
      bgColor: 'bg-primary' // Adjusted color
    },
    {
      id: 4,
      user: 'You',
      time: '1:20 PM',
      message: 'Sounds good. I can start drawing the flow.',
      avatar: 'You',
      bgColor: 'bg-primary',
      isUser: true
    }
  ]);

  const messagesEndRef = useRef(null); // Ref for scrolling to bottom

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: 'You', // In a real app, this would be the logged-in user's name
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: message,
        avatar: 'You', // Or initials of logged-in user
        bgColor: 'bg-primary',
        isUser: true
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className="bg-dark-card rounded-xl flex flex-col flex-1 shadow-lg">
      <div className="p-4 border-b border-border-color">
        <h3 className="text-white font-semibold text-lg">Chat</h3>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} space-x-3`}>
            {!msg.isUser && (
              <div className={`w-9 h-9 ${msg.bgColor} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow`}>
                <span>{msg.avatar === 'You' ? '\ud83d\udc64' : msg.avatar}</span>
              </div>
            )}
            <div className="flex-1 max-w-[80%]">
              <div className={`flex items-center space-x-2 mb-1 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <span className="text-white text-sm font-semibold">{msg.user}</span>
                <span className="text-gray-text text-xs">{msg.time}</span>
              </div>
              <div className={`text-sm p-3 rounded-2xl shadow ${msg.isUser ? 'bg-primary text-white ml-4 rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>{msg.message}</div>
            </div>
            {msg.isUser && (
              <div className={`w-9 h-9 ${msg.bgColor} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow`}>
                <span>{msg.avatar === 'You' ? '\ud83d\udc64' : msg.avatar}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border-color">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow"
          />
          <button
            type="submit"
            className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors shadow"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;