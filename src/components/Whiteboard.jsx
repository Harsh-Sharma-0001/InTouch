import React, { useRef, useEffect, useState, useCallback } from 'react';
import { logMonitoringEvent } from '../utils/monitoringClient';
import { Edit, Trash2 } from 'lucide-react';

const Whiteboard = ({ socket, roomId }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const idleTimerRef = useRef(null);
  const idleMs = 60000; // 60s
  const participant = typeof localStorage !== 'undefined' ? (localStorage.getItem('userName') || '') : '';

  // Draw a line on the canvas
  const drawLine = (ctx, x1, y1, x2, y2, color = '#000', width = 2) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Real-time: listen for draw/clear events
  useEffect(() => {
    if (!socket || !roomId) return;
    const handleDraw = ({ x1, y1, x2, y2 }) => {
      const ctx = canvasRef.current.getContext('2d');
      drawLine(ctx, x1, y1, x2, y2);
    };
    const handleClear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    socket.on('whiteboard-draw', handleDraw);
    socket.on('whiteboard-clear', handleClear);
    return () => {
      socket.off('whiteboard-draw', handleDraw);
      socket.off('whiteboard-clear', handleClear);
    };
  }, [socket, roomId]);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.putImageData(imageData, 0, 0);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    setLastPos(getCoordinates(e));
    resetIdleTimer();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentPos = getCoordinates(e);
    drawLine(ctx, lastPos.x, lastPos.y, currentPos.x, currentPos.y);
    // Broadcast to others
    if (socket && roomId) {
      socket.emit('whiteboard-draw', { roomId, x1: lastPos.x, y1: lastPos.y, x2: currentPos.x, y2: currentPos.y });
    }
    setLastPos(currentPos);
    resetIdleTimer();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (socket && roomId) {
      socket.emit('whiteboard-clear', { roomId });
    }
    resetIdleTimer();
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      logMonitoringEvent({ type: 'Inactivity', severity: 'warning', details: `Whiteboard idle in room ${roomId}`, participant });
    }, idleMs);
  };

  useEffect(() => {
    resetIdleTimer();
    const onMouse = () => resetIdleTimer();
    window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-dark-card rounded-lg" onContextMenu={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Right-click blocked in Whiteboard room ${roomId}`, participant }); }}>
      <div className="flex items-center justify-between p-4 border-b border-border-color">
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-dark-lighter rounded hover:bg-gray-600 text-white">
            <Edit size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 bg-dark-lighter rounded hover:bg-gray-600 text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white rounded-lg cursor-crosshair border border-border-color"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onCopy={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Copy blocked in Whiteboard room ${roomId}`, participant }); }}
          onPaste={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Paste blocked in Whiteboard room ${roomId}`, participant }); }}
          onCut={(e) => { e.preventDefault(); logMonitoringEvent({ type: 'ClipboardBlocked', severity: 'warning', details: `Cut blocked in Whiteboard room ${roomId}`, participant }); }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;