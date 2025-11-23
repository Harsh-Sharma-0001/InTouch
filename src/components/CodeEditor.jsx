import React, { useState, useEffect, useRef } from 'react';
import { logMonitoringEvent } from '../utils/monitoringClient';

const CodeEditor = ({ socket, roomId }) => {
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Expected: 55`);
  const isRemoteUpdate = useRef(false);
  const idleTimerRef = useRef(null);
  const idleMs = 60000; // 60s inactivity threshold
  const participant = typeof localStorage !== 'undefined' ? (localStorage.getItem('userName') || '') : '';

  // Listen for code updates from other users
  useEffect(() => {
    if (!socket || !roomId) return;
    const handler = (newCode) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
    };
    socket.on('code-update', handler);
    return () => socket.off('code-update', handler);
  }, [socket, roomId]);

  // Broadcast code changes
  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (!isRemoteUpdate.current && socket && roomId) {
      socket.emit('code-update', { roomId, code: newCode });
    }
    isRemoteUpdate.current = false;
    resetIdleTimer();
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      logMonitoringEvent({ type: 'Inactivity', severity: 'warning', details: `CodeEditor idle in room ${roomId}`, participant });
    }, idleMs);
  };

  useEffect(() => {
    // Start timer and wire events for activity detection
    resetIdleTimer();
    const onKey = () => resetIdleTimer();
    const onMouse = () => resetIdleTimer();
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMouse);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-dark-card rounded-lg" onContextMenu={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Right-click blocked in CodeEditor room ${roomId}`, participant }); }}>
      <div className="flex-1 p-4">
        <textarea
          value={code}
          onChange={handleChange}
          className="w-full h-full bg-dark-card text-green-400 font-mono text-sm p-4 rounded-lg border border-border-color resize-none focus:outline-none focus:border-primary"
          style={{ fontFamily: 'Monaco, Consolas, \"Courier New\", monospace' }}
          spellCheck="false"
          onCopy={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Copy blocked in CodeEditor room ${roomId}`, participant }); }}
          onPaste={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Paste blocked in CodeEditor room ${roomId}`, participant }); }}
          onCut={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Cut blocked in CodeEditor room ${roomId}`, participant }); }}
        />
      </div>
      <div className="border-t border-border-color p-4">
        <div className="text-gray-text text-sm">
          <div>console.log(fibonacci(10));</div>
          <div className="text-white">Expected: 55</div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;