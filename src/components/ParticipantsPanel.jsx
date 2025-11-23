// import React from 'react'
// import { Mic, MicOff, Video, VideoOff, MoreHorizontal } from 'lucide-react'

// const ParticipantsPanel = () => {
//   const participants = [
//     { 
//       name: 'Harsh Sharma', 
//       avatar: 'HS', 
//       mic: true, 
//       video: false,
//       bgColor: 'bg-blue-500'
//     },
//     { 
//       name: 'Prakhar Patel', 
//       avatar: 'PP', 
//       mic: false, 
//       video: false,
//       bgColor: 'bg-green-500'
//     },
//     { 
//       name: 'Abhishek Rajput', 
//       avatar: 'AR', 
//       mic: false, 
//       video: false,
//       bgColor: 'bg-purple-500'
//     },
//     { 
//       name: 'Hariom Tiwari', 
//       avatar: 'HT', 
//       mic: false, 
//       video: false,
//       bgColor: 'bg-orange-500'
//     },
//     { 
//       name: 'Kartikey Verma', 
//       avatar: 'KV', 
//       mic: false, 
//       video: false,
//       bgColor: 'bg-pink-500'
//     }
//   ]

//   return (
//     <div className="bg-dark-card rounded-lg p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-white font-medium">Participants (5)</h3>
//         <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80">
//           + Add
//         </button>
//       </div>
      
//       <div className="space-y-3">
//         {participants.map((participant, index) => (
//           <div key={index} className="flex items-center space-x-3">
//             <div className={`w-8 h-8 ${participant.bgColor} rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xs font-medium">{participant.avatar}</span>
//             </div>
            
//             <div className="flex-1">
//               <div className="text-white text-sm font-medium">{participant.name}</div>
//             </div>
            
//             <div className="flex items-center space-x-1">
//               <button className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}>
//                 {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
//               </button>
//               <button className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}>
//                 {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
//               </button>
//               <button className="p-1 text-gray-400 hover:text-white">
//                 <MoreHorizontal size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default ParticipantsPanel







// import React, { useState } from 'react';
// import { Mic, MicOff, Video, VideoOff, MoreHorizontal } from 'lucide-react';

// const ParticipantsPanel = () => {
//   // Use state to manage mic/video status for each participant
//   const [participants, setParticipants] = useState([
//     {
//       id: 1,
//       name: 'Sundar Pichai',
//       avatar: 'SP',
//       mic: true,
//       video: true, // Set to true for Benjamin as per screenshot
//       bgColor: 'bg-primary' // Use primary for Benjamin
//     },
//     {
//       id: 2,
//       name: 'Prakhar Patel',
//       avatar: 'PP',
//       mic: false,
//       video: false,
//       bgColor: 'bg-blue-500'
//     },
//     {
//       id: 3,
//       name: 'Abhishek Rajput',
//       avatar: 'AR',
//       mic: false,
//       video: false,
//       bgColor: 'bg-green-500'
//     },
//     {
//       id: 4,
//       name: 'Hariom Tiwari',
//       avatar: 'HT',
//       mic: false,
//       video: false,
//       bgColor: 'bg-purple-500'
//     },
//     {
//       id: 5,
//       name: 'Harsh Sharma',
//       avatar: 'HS',
//       mic: false,
//       video: false,
//       bgColor: 'bg-orange-500'
//     }
//   ]);

//   const toggleMic = (id) => {
//     setParticipants(prevParticipants =>
//       prevParticipants.map(p =>
//         p.id === id ? { ...p, mic: !p.mic } : p
//       )
//     );
//   };

//   const toggleVideo = (id) => {
//     setParticipants(prevParticipants =>
//       prevParticipants.map(p =>
//         p.id === id ? { ...p, video: !p.video } : p
//       )
//     );
//   };

//   return (
//     <div className="bg-dark-card rounded-lg p-4 flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 and scrollbar */}
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-white font-medium">Participants ({participants.length})</h3>
//         <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80">
//           + Add
//         </button>
//       </div>

//       <div className="space-y-3">
//         {participants.map((participant) => (
//           <div key={participant.id} className="flex items-center space-x-3">
//             <div className={`w-8 h-8 ${participant.bgColor} rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xs font-medium">{participant.avatar}</span>
//             </div>

//             <div className="flex-1">
//               <div className="text-white text-sm font-medium">{participant.name}</div>
//             </div>

//             <div className="flex items-center space-x-1">
//               <button
//                 onClick={() => toggleMic(participant.id)}
//                 className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}
//               >
//                 {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
//               </button>
//               <button
//                 onClick={() => toggleVideo(participant.id)}
//                 className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}
//               >
//                 {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
//               </button>
//               <button className="p-1 text-gray-text hover:text-white"> {/* Using gray-text */}
//                 <MoreHorizontal size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ParticipantsPanel;






// import React, { useState, useEffect } from 'react'; // Import useEffect
// import { Mic, MicOff, Video, VideoOff, MoreHorizontal } from 'lucide-react';

// // ParticipantsPanel now takes props for current user's mic/video state
// const ParticipantsPanel = ({ isLocalMicMuted, isLocalVideoOff, participants, setParticipants, toggleMic, toggleVideo }) => {
//   // Use state to manage mic/video status for each participant
//   // The 'participants' state is now mostly controlled by props for better coordination
//   // However, local participant's state needs to be managed here for UI feedback too

//   // Find the local participant (Sundar Pichai) to update their status in the list
//   const localParticipantId = 1; // Assuming Sundar Pichai is always ID 1 in this list

//   useEffect(() => {
//     setParticipants(prevParticipants =>
//       prevParticipants.map(p => {
//         if (p.id === localParticipantId) {
//           return { ...p, mic: !isLocalMicMuted, video: !isLocalVideoOff };
//         }
//         return p;
//       })
//     );
//   }, [isLocalMicMuted, isLocalVideoOff, setParticipants]); // Update when local mic/video state changes

//   return (
//     <div className="bg-dark-card rounded-lg p-4 flex-1 overflow-y-auto custom-scrollbar">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-white font-medium">Participants ({participants.length})</h3>
//         <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80">
//           + Add
//         </button>
//       </div>

//       <div className="space-y-3">
//         {participants.map((participant) => (
//           <div key={participant.id} className="flex items-center space-x-3">
//             <div className={`w-8 h-8 ${participant.bgColor} rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xs font-medium">{participant.avatar}</span>
//             </div>

//             <div className="flex-1">
//               <div className="text-white text-sm font-medium">{participant.name}</div>
//             </div>

//             <div className="flex items-center space-x-1">
//               {/* Only allow toggling for the local participant (Sundar Pichai) in this demo */}
//               {participant.id === localParticipantId ? (
//                 <>
//                   <button
//                     onClick={() => toggleMic()} // Call the toggleMic from VideoSection
//                     className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}
//                   >
//                     {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
//                   </button>
//                   <button
//                     onClick={() => toggleVideo()} // Call the toggleVideo from VideoSection
//                     className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}
//                   >
//                     {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   {/* For other participants, just display their current (simulated) status */}
//                   <span className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}>
//                     {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
//                   </span>
//                   <span className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}>
//                     {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
//                   </span>
//                 </>
//               )}

//               <button className="p-1 text-gray-text hover:text-white">
//                 <MoreHorizontal size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ParticipantsPanel;






// import React, { useEffect } from 'react';
// import { Mic, MicOff, Video, VideoOff, MoreHorizontal } from 'lucide-react';

// const ParticipantsPanel = ({ isLocalMicMuted, isLocalVideoOff, participants, localParticipantId, toggleMic, toggleVideo, socket, roomId }) => {
//   useEffect(() => {
//     // This effect ensures the local participant's mic/video status in the participants list
//     // is kept in sync with the actual state from InterviewRoomLayout.
//     // The `setParticipants` prop is no longer passed down here, as the source of truth
//     // for `participants` state is now `InterviewRoomLayout` via props.
//   }, [isLocalMicMuted, isLocalVideoOff]);

//   return (
//     <div className="bg-dark-card rounded-lg p-4 flex-1 overflow-y-auto custom-scrollbar">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-white font-medium">Participants ({participants.length + 1})</h3> {/* +1 for local user */}
//         <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80">
//           + Add
//         </button>
//       </div>

//       <div className="space-y-3">
//         {/* Render local participant first */}
//         <div key={localParticipantId} className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
//             <span className="text-white text-xs font-medium">SP</span>
//           </div>
//           <div className="flex-1">
//             <div className="text-white text-sm font-medium">You (Sundar Pichai)</div>
//           </div>
//           <div className="flex items-center space-x-1">
//             <button
//               onClick={toggleMic}
//               className={`p-1 rounded ${!isLocalMicMuted ? 'text-white' : 'text-red-500'}`}
//             >
//               {!isLocalMicMuted ? <Mic size={14} /> : <MicOff size={14} />}
//             </button>
//             <button
//               onClick={toggleVideo}
//               className={`p-1 rounded ${!isLocalVideoOff ? 'text-white' : 'text-red-500'}`}
//             >
//               {!isLocalVideoOff ? <Video size={14} /> : <VideoOff size={14} />}
//             </button>
//             <button className="p-1 text-gray-text hover:text-white">
//               <MoreHorizontal size={14} />
//             </button>
//           </div>
//         </div>

//         {/* Render remote participants */}
//         {participants.map((participant) => (
//           <div key={participant.id} className="flex items-center space-x-3">
//             <div className={`w-8 h-8 ${participant.bgColor} rounded-full flex items-center justify-center`}>
//               <span className="text-white text-xs font-medium">{participant.avatar}</span>
//             </div>
//             <div className="flex-1">
//               <div className="text-white text-sm font-medium">{participant.name}</div>
//             </div>
//             <div className="flex items-center space-x-1">
//               <span className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}>
//                 {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
//               </span>
//               <span className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}>
//                 {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
//               </span>
//               <button className="p-1 text-gray-text hover:text-white">
//                 <MoreHorizontal size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ParticipantsPanel;






import React, { useState } from 'react'; // No need for useState, useEffect here if state is truly managed externally
import { Mic, MicOff, Video, VideoOff, MoreHorizontal } from 'lucide-react';

const getMeetingLink = (roomId) => {
  // You may want to use window.location.origin in a real app
  return `${window.location.origin}/interview?roomId=${roomId}`;
};

const shareOptions = [
  {
    name: 'WhatsApp',
    url: (link) => `https://wa.me/?text=Join%20my%20InTouch%20interview%20room:%20${encodeURIComponent(link)}`,
  },
  {
    name: 'Gmail',
    url: (link) => `https://mail.google.com/mail/?view=cm&fs=1&to=&su=Join%20my%20InTouch%20interview%20room&body=${encodeURIComponent(link)}`,
  },
  {
    name: 'Instagram',
    url: (link) => `https://www.instagram.com/direct/new/?text=${encodeURIComponent(link)}`,
  },
  {
    name: 'Snapchat',
    url: (link) => `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(link)}`,
  },
  {
    name: 'LinkedIn',
    url: (link) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
  },
];

const ParticipantsPanel = ({ participants: initialParticipants = [], setParticipants, onAdd, roomId, socket }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [participants, setLocalParticipants] = useState(initialParticipants);
  const [showShare, setShowShare] = useState(false);

  const handleAddParticipant = () => {
    setShowShare(true);
  };

  const handleShare = (option) => {
    const link = getMeetingLink(roomId);
    window.open(option.url(link), '_blank');
  };

  // When a new user joins via link, socket event should update participants in real time (handled in parent)

  const toggleMic = (id) => {
    setLocalParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === id ? { ...p, mic: !p.mic } : p
      )
    );
    if (setParticipants) setParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === id ? { ...p, mic: !p.mic } : p
      )
    );
  };

  const toggleVideo = (id) => {
    setLocalParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === id ? { ...p, video: !p.video } : p
      )
    );
    if (setParticipants) setParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === id ? { ...p, video: !p.video } : p
      )
    );
  };

  return (
    <div className="bg-dark-card rounded-lg p-4 flex-1 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Participants ({participants.length})</h3>
        <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80" onClick={() => setShowAddModal(true)}>
          + Add
        </button>
      </div>
      <div className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${participant.bgColor} rounded-full flex items-center justify-center`}>
              <span className="text-white text-xs font-medium">{participant.avatar}</span>
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">{participant.name}</div>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => toggleMic(participant.id)} className={`p-1 rounded ${participant.mic ? 'text-white' : 'text-red-500'}`}>
                {participant.mic ? <Mic size={14} /> : <MicOff size={14} />}
              </button>
              <button onClick={() => toggleVideo(participant.id)} className={`p-1 rounded ${participant.video ? 'text-white' : 'text-red-500'}`}>
                {participant.video ? <Video size={14} /> : <VideoOff size={14} />}
              </button>
              <button className="p-1 text-gray-text hover:text-white">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-dark-card p-6 rounded-lg shadow-lg flex flex-col gap-4 w-80">
            <h2 className="text-lg font-bold">Invite to Interview Room</h2>
            <a
              href={getMeetingLink(roomId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline break-all mb-2"
            >
              {getMeetingLink(roomId)}
            </a>
            <div className="flex flex-col gap-2">
              {shareOptions.map(option => (
                <button
                  key={option.name}
                  className="w-full px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
                  onClick={() => handleShare(option)}
                >
                  Share via {option.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowAddModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsPanel;