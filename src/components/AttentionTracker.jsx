import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TrendingUp, TrendingDown, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const AttentionTracker = React.memo(({ attentionScore, eyeTracking, faceDetected }) => {
  const [attentionHistory, setAttentionHistory] = useState(() => []);
  const [averageScore, setAverageScore] = useState(0);
  const [alerts, setAlerts] = useState(() => []);
  const [lastUpdate, setLastUpdate] = useState(() => Date.now());
  const [isLive, setIsLive] = useState(false);
  
  const lastDataRef = useRef({ attentionScore: 0, eyeTracking: { leftEye: false, rightEye: false }, faceDetected: false });
  const updateThrottleRef = useRef(0);
  const lastAlertTimeRef = useRef(0);
  const THROTTLE_MS = 100; // Update at most every 100ms (10fps for UI)

  // Update attention history and check for changes - Throttled to prevent excessive re-renders
  useEffect(() => {
    const now = Date.now();
    
    // Throttle updates to prevent flickering
    if (now - updateThrottleRef.current < THROTTLE_MS) {
      return;
    }
    updateThrottleRef.current = now;
    
    // Check if data actually changed
    const currentData = { attentionScore, eyeTracking, faceDetected };
    const lastData = lastDataRef.current;
    const dataChanged = 
      lastData.attentionScore !== attentionScore ||
      lastData.eyeTracking?.leftEye !== eyeTracking?.leftEye ||
      lastData.eyeTracking?.rightEye !== eyeTracking?.rightEye ||
      lastData.faceDetected !== faceDetected;
    
    if (!dataChanged && attentionHistory.length > 0) {
      return; // Skip update if data hasn't changed
    }
    
    lastDataRef.current = currentData;
    setLastUpdate(now);
    
    // Set live status based on actual face detection and attention score
    // STRICT: Only show live if face is detected AND attention score is reasonable
    setIsLive(faceDetected && attentionScore > 0);

    // Add to history and calculate average in one update
    setAttentionHistory(prevHistory => {
      const newHistory = [...prevHistory, { 
        score: faceDetected ? attentionScore : 0, 
        timestamp: now,
        faceDetected,
        eyeTracking: { ...eyeTracking }
      }];
      
      // Keep only last 60 entries (last 6 seconds at 10fps)
      const trimmedHistory = newHistory.length > 60 ? newHistory.slice(-60) : newHistory;
      
      // Calculate average score
      const validScores = trimmedHistory
        .filter(item => item.faceDetected)
        .map(item => item.score);
      const avg = validScores.length > 0 
        ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
        : 0;
      setAverageScore(Math.round(avg));
      
      return trimmedHistory;
    });
    
    // Check for alerts with precise thresholds - throttled
    if (faceDetected && attentionScore < 40 && now - lastAlertTimeRef.current > 2000) {
      lastAlertTimeRef.current = now;
      const newAlert = {
        id: now,
        message: attentionScore < 25 ? 'Critical: Very low attention!' : 'Warning: Low attention detected',
        severity: attentionScore < 25 ? 'critical' : 'warning',
        timestamp: new Date().toLocaleTimeString()
      };
      setAlerts(prev => [...prev.slice(-4), newAlert]);
    }
  }, [attentionScore, eyeTracking, faceDetected]); // Removed attentionHistory.length to prevent infinite loops

  // Auto-clear live status immediately when face is not detected or score is 0
  useEffect(() => {
    if (!faceDetected || attentionScore === 0) {
      setIsLive(false);
    } else {
      setIsLive(true);
    }
  }, [faceDetected, attentionScore]);

  const getAttentionColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-green-300';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-yellow-300';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAttentionBgColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-yellow-400';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = () => {
    if (attentionHistory.length < 2) return null;
    const recent = attentionHistory.slice(-10);
    const avg = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
    const previous = attentionHistory.slice(-20, -10);
    const prevAvg = previous.length > 0 ? previous.reduce((sum, item) => sum + item.score, 0) / previous.length : avg;
    
    if (avg > prevAvg + 5) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (avg < prevAvg - 5) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  // Generate attention trend data for the chart - Memoized to prevent recalculation
  const trendData = useMemo(() => {
    const recentData = attentionHistory.slice(-30); // Last 30 data points
    if (recentData.length === 0) return [];
    
    return recentData.map((item, index) => ({
      x: index,
      y: item.score,
      timestamp: item.timestamp,
      faceDetected: item.faceDetected
    }));
  }, [attentionHistory]);

  return (
    <div className="bg-dark-card rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Attention Analytics</h3>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getAttentionColor(attentionScore || 0)}`}>
            {attentionScore || 0}%
          </span>
        </div>
      </div>

      {/* Attention Score Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Current Attention</span>
          <span>Average: {averageScore}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getAttentionBgColor(attentionScore || 0)}`}
            style={{ width: `${attentionScore || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Eye Tracking Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Eye Tracking</span>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${eyeTracking?.leftEye ? 'text-green-400' : 'text-red-400'}`}>
            {eyeTracking?.leftEye ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-xs">L</span>
          </div>
          <div className={`flex items-center space-x-1 ${eyeTracking?.rightEye ? 'text-green-400' : 'text-red-400'}`}>
            {eyeTracking?.rightEye ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-xs">R</span>
          </div>
        </div>
      </div>

      {/* Face Detection Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Face Detection</span>
        <div className={`flex items-center space-x-2 ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs">{faceDetected ? 'Detected' : 'Not Detected'}</span>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Status</span>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs">{isLive ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Recent Alerts</span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {alerts.slice(-3).map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between text-xs rounded p-2 ${
                alert.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              }`}>
                <span className={alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}>{alert.message}</span>
                <span className="text-gray-400">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attention History Chart - Real-time */}
      {trendData.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm text-gray-400">Attention Trend (Live)</span>
          <div className="flex items-end justify-between h-20 space-x-0.5">
            {trendData.map((item, index) => (
              <div
                key={`${item.timestamp}-${index}`}
                className={`flex-1 rounded-t transition-all duration-300 ${getAttentionBgColor(item.y)}`}
                style={{ 
                  height: `${Math.max(2, (item.y / 100) * 100)}%`,
                  opacity: item.faceDetected ? 1 : 0.3
                }}
                title={`${item.y}% at ${new Date(item.timestamp).toLocaleTimeString()}`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* No Face Detected Warning */}
      {!faceDetected && attentionHistory.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">No face detected. Please position yourself in front of the camera.</span>
          </div>
        </div>
      )}

      {/* Debug Information (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 space-y-1 border-t border-gray-700 pt-2">
          <div>Debug: Attention Score: {attentionScore || 0}%</div>
          <div>Debug: Face Detected: {faceDetected ? 'Yes' : 'No'}</div>
          <div>Debug: Left Eye: {eyeTracking?.leftEye ? 'Open' : 'Closed'}</div>
          <div>Debug: Right Eye: {eyeTracking?.rightEye ? 'Open' : 'Closed'}</div>
          <div>Debug: Last Update: {new Date(lastUpdate).toLocaleTimeString()}</div>
          <div>Debug: History Length: {attentionHistory.length}</div>
          <div>Debug: Status: {isLive ? 'Live' : 'Offline'}</div>
        </div>
      )}
    </div>
  );
});

AttentionTracker.displayName = 'AttentionTracker';

export default AttentionTracker; 