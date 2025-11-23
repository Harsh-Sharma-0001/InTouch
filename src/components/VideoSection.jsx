import React, { useEffect, useRef, useMemo, useCallback } from 'react';

const VideoSection = React.memo(({ 
  localVideoRef, 
  isMuted, 
  isVideoOff, 
  remoteStreams, 
  overlays, 
  isPresenting,
  faceDetected,
  eyeTracking,
  attentionScore,
  canvasRef,
  showRemoteStreams = true,
  compactMode = false
}) => {
  const videoContainerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  // Throttled canvas size update
  const updateCanvasSize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      if (canvasRef && canvasRef.current && localVideoRef.current && videoContainerRef.current) {
        const container = videoContainerRef.current;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        // Only update if size actually changed
        if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    }, 100); // Debounce resize events
  }, [canvasRef, localVideoRef]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [updateCanvasSize]);

  // Memoize attention color calculation
  const attentionColor = useMemo(() => {
    if (attentionScore >= 80) return 'bg-green-500';
    if (attentionScore >= 60) return 'bg-yellow-500';
    if (attentionScore >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }, [attentionScore]);

  const videoSize = compactMode ? 'w-60 h-60' : 'w-72 h-72';
  const spacing = compactMode ? '' : 'space-y-4';
  const alignment = compactMode ? 'items-start' : 'items-center';

  return (
    <div className={`flex flex-col ${compactMode ? '' : 'h-full'} ${spacing} ${alignment}`}>
      {/* Main Video Container */}
      <div ref={videoContainerRef} className={`relative ${videoSize} bg-dark-card rounded-xl overflow-hidden shadow-lg flex items-center justify-center`}>
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted={isMuted} 
          className="w-full h-full object-cover rounded-xl" 
          style={{ 
            objectFit: 'cover', 
            aspectRatio: '1/1',
            transform: 'scaleX(-1)' // Mirror the video display
          }} 
        />
        {canvasRef && (
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            style={{ 
              width: '100%', 
              height: '100%',
              transform: 'scaleX(-1)' // Mirror the canvas overlay to match video
            }} 
          />
        )}
        
        {/* Face Detection Overlay */}
        {faceDetected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-20">
            Face Detected
          </div>
        )}
        
        {/* Eye Tracking Overlay */}
        <div className="absolute bottom-2 left-2 flex space-x-2 z-20">
          <div className={`w-3 h-3 rounded-full ${eyeTracking?.leftEye ? 'bg-green-400' : 'bg-red-400'}`} title="Left Eye"></div>
          <div className={`w-3 h-3 rounded-full ${eyeTracking?.rightEye ? 'bg-green-400' : 'bg-red-400'}`} title="Right Eye"></div>
        </div>
        
        {/* Attention Score Overlay */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-20">
          Attention: {attentionScore || 0}%
        </div>

        {/* Video Off Overlay */}
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
            </svg>
          </div>
        )}

        {/* Muted Indicator */}
        {isMuted && !isVideoOff && (
          <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-2 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 016 0v13m-6 0a3 3 0 006 0m-6 0v-1a3 3 0 016 0v1" />
            </svg>
          </div>
        )}

        {/* Presenter Label */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-sm font-medium shadow z-20">
          You (Presenter)
        </div>
      </div>

      {/* Attention Level Tracking Bar - Compact in compactMode */}
      {!compactMode && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Attention Level</span>
            <span>{attentionScore || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${attentionColor}`}
              style={{ width: `${Math.max(0, Math.min(100, attentionScore || 0))}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Remote Streams - Hidden in compactMode */}
      {showRemoteStreams && !compactMode && (
        <div className="flex flex-wrap gap-2 justify-center">
          {remoteStreams && remoteStreams.map((stream, idx) => {
          const remoteVideoOff = overlays && overlays[stream.id]?.videoOff;
          const remoteMuted = overlays && overlays[stream.id]?.muted;
          return (
            <div key={idx} className="relative w-24 h-24 bg-dark-card rounded-lg overflow-hidden flex items-center justify-center shadow">
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={el => {
                  if (el && stream.stream) {
                    el.srcObject = stream.stream;
                  }
                }}
              />
              {remoteVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                  </svg>
                </div>
              )}
              {remoteMuted && !remoteVideoOff && (
                <div className="absolute bottom-1 left-1 bg-black/70 rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 016 0v13m-6 0a3 3 0 006 0m-6 0v-1a3 3 0 016 0v1" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                {stream.name}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
});

VideoSection.displayName = 'VideoSection';

export default VideoSection;