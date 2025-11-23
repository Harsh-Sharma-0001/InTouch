import React, { useEffect, useRef } from 'react';

const InterviewerVideoSection = React.memo(({ 
  interviewerStream,
  interviewerName = 'Interviewer',
  isMuted: interviewerMuted = false,
  isVideoOff: interviewerVideoOff = false,
  compactMode = false
}) => {
  const interviewerVideoRef = useRef(null);

  // Set the stream to the video element
  useEffect(() => {
    if (interviewerVideoRef.current && interviewerStream) {
      // Only update if the stream has changed
      if (interviewerVideoRef.current.srcObject !== interviewerStream) {
        interviewerVideoRef.current.srcObject = interviewerStream;
      }
    } else if (interviewerVideoRef.current && !interviewerStream) {
      // Clear the stream if no interviewer stream
      interviewerVideoRef.current.srcObject = null;
    }
  }, [interviewerStream]);

  const videoSize = compactMode ? 'w-60 h-60' : 'w-72 h-72';

  if (!interviewerStream) {
    return (
      <div className={`relative ${videoSize} bg-dark-card rounded-xl overflow-hidden shadow-lg flex items-center justify-center border-2 border-dashed border-gray-600`}>
        <div className="text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm">Waiting for interviewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full">
      {/* Interviewer Video Container */}
      <div className={`relative ${videoSize} bg-dark-card rounded-xl overflow-hidden shadow-lg flex items-center justify-center`}>
        <video 
          ref={interviewerVideoRef} 
          autoPlay 
          playsInline 
          muted={false} // Don't mute interviewer's audio
          className="w-full h-full object-cover rounded-xl" 
          style={{ 
            objectFit: 'cover', 
            aspectRatio: '1/1'
          }} 
        />

        {/* Video Off Overlay */}
        {interviewerVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
            </svg>
          </div>
        )}

        {/* Muted Indicator */}
        {interviewerMuted && !interviewerVideoOff && (
          <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-2 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 016 0v13m-6 0a3 3 0 006 0m-6 0v-1a3 3 0 016 0v1" />
            </svg>
          </div>
        )}

        {/* Interviewer Label */}
        <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium shadow z-20">
          {interviewerName} (Interviewer)
        </div>
      </div>
    </div>
  );
});

InterviewerVideoSection.displayName = 'InterviewerVideoSection';

export default InterviewerVideoSection;

