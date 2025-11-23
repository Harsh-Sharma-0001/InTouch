import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Interview.css';
import InterviewHeader from '../components/InterviewHeader';
import Sidebar from '../components/Sidebar';
import VideoSection from '../components/VideoSection';
import InterviewerVideoSection from '../components/InterviewerVideoSection';
import CodeEditor from '../components/CodeEditor';
import Whiteboard from '../components/Whiteboard';
import ParticipantsPanel from '../components/ParticipantsPanel';
import ChatPanel from '../components/ChatPanel';
import ControlBar from '../components/ControlBar';
import Footer from '../components/Footer';
import AttentionTracker from '../components/AttentionTracker';
import useFaceDetection from '../hooks/useFaceDetection';
import LiveCaptions from '../components/LiveCaptions';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { logMonitoringEvent } from '../utils/monitoringClient';
import { SOCKET_URL } from '../utils/config.js';

const socket = io(SOCKET_URL);

// TURN/STUN configuration for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Add your own TURN server here when available
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ]
};

const InterviewLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get roomId from URL
  const params = new URLSearchParams(location.search);
  const roomId = params.get('roomId') || 'interview-room-123';

  // Simulate auth (replace with real auth in production)
  // Get role from URL params or localStorage, default to 'interviewee'
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('userName');
    const roleFromUrl = params.get('role'); // 'interviewer' or 'interviewee'
    const roleFromStorage = localStorage.getItem('userRole');
    const userRole = roleFromUrl || roleFromStorage || 'interviewee';
    
    if (u) {
      // Store role in localStorage for persistence
      if (roleFromUrl) {
        localStorage.setItem('userRole', roleFromUrl);
      }
      return { name: u, role: userRole };
    }
    return null;
  });

  // Auth redirect logic
  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login with redirect param
      navigate(`/login?redirect=/interview?roomId=${roomId}`);
    }
  }, [user, roomId, navigate]);

  // Participants and video state
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{id, stream, name, role}]
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [liveCaptionsEnabled, setLiveCaptionsEnabled] = useState(false);
  const localVideoRef = useRef(null);
  
  // Add state for overlays and meeting end (must be declared before interviewerMediaState)
  const [mediaStates, setMediaStates] = useState({}); // { [socketId]: { muted, videoOff, isSharingScreen } }
  const [meetingEnded, setMeetingEnded] = useState(false);
  
  // Interviewer video state - identify interviewer by role
  const interviewerStream = useMemo(() => {
    // Find the remote stream with role 'interviewer'
    return remoteStreams.find(s => s.role === 'interviewer') || null;
  }, [remoteStreams]);
  
  const interviewerName = useMemo(() => {
    if (interviewerStream?.name) {
      return interviewerStream.name;
    }
    // Try to find interviewer from participants list
    const interviewerParticipant = participants.find(p => 
      !p.isLocal && p.role === 'interviewer'
    );
    return interviewerParticipant?.name || 'Interviewer';
  }, [interviewerStream, participants]);
  
  const interviewerMediaState = useMemo(() => {
    if (!interviewerStream) return { muted: false, videoOff: false };
    return mediaStates[interviewerStream.id] || { muted: false, videoOff: false };
  }, [interviewerStream, mediaStates]);
  // Add refs for local stream and media recorder
  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamInitializedRef = useRef(false); // Track if stream has been initialized
  const [isPresenting, setIsPresenting] = useState(false);
  const [recordingChunks, setRecordingChunks] = useState([]);
  const peersRef = useRef({}); // { socketId: SimplePeerInstance }

  // Enhanced state for face detection and attention tracking
  const [attentionData, setAttentionData] = useState({
    currentScore: 100,
    averageScore: 100,
    history: [],
    alerts: []
  });

  // Face detection hook
  const { faceDetected, eyeTracking, attentionScore, canvasRef, isProcessing, isInitialized } = useFaceDetection(localVideoRef);

  // Face detection is now active (debug logging removed for performance)

  // Helper function to create a peer connection
  const createPeerConnection = useCallback((otherUserId, otherUserData, isInitiator) => {
    if (!localStreamRef.current || peersRef.current[otherUserId]) {
      return; // Already have a peer connection or no local stream
    }

    const peer = new SimplePeer({ 
      initiator: isInitiator, 
      trickle: true, 
      stream: localStreamRef.current,
      config: ICE_SERVERS
    });

    peersRef.current[otherUserId] = peer;

    peer.on('signal', (data) => {
      if (isInitiator) {
        socket.emit('offer', { target: otherUserId, caller: socket.id, signal: data });
      } else {
        socket.emit('answer', { target: otherUserId, responder: socket.id, signal: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams(prev => {
        const exists = prev.some(s => s.id === otherUserId);
        if (exists) {
          return prev.map(s => 
            s.id === otherUserId 
              ? { ...s, stream: remoteStream, name: otherUserData.name || 'Guest', role: otherUserData.role || 'interviewee' }
              : s
          );
        }
        return [...prev, { 
          id: otherUserId, 
          stream: remoteStream, 
          name: otherUserData.name || 'Guest',
          role: otherUserData.role || 'interviewee'
        }];
      });
    });

    peer.on('error', (err) => {
      console.error(`Peer connection error with ${otherUserId}:`, err);
    });

    peer.on('close', () => {
      console.log(`Peer connection closed with ${otherUserId}`);
      delete peersRef.current[otherUserId];
    });

    return peer;
  }, []);

  // On join: prompt for video/mic, add to participants, broadcast to all, setup WebRTC
  useEffect(() => {
    if (!user) return;
    
    // server/index.js expects { roomId, user } with role
    socket.emit('join-room', { roomId, user: { name: user.name, role: user.role } });
    
    // Initialize media stream only once
    if (!localStreamRef.current && !streamInitializedRef.current) {
      streamInitializedRef.current = true;
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          localStreamRef.current = stream;
          // Set enabled state for tracks independently based on current state
          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];
          if (videoTrack) videoTrack.enabled = true; // Start enabled
          if (audioTrack) audioTrack.enabled = true; // Start enabled
          
          setParticipants(prev => {
            const existing = prev.find(p => p.name === user.name && p.isLocal);
            if (existing) return prev;
            return [
              ...prev.filter(p => !p.isLocal || p.name !== user.name),
              { 
                id: socket.id, 
                name: user.name,
                role: user.role,
                avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase(), 
                mic: true, 
                video: true, 
                bgColor: 'bg-primary', 
                isLocal: true 
              }
            ];
          });
          socket.emit('participant-joined', { id: socket.id, name: user.name, role: user.role });
        })
        .catch(err => {
          console.error('Error getting user media:', err);
          streamInitializedRef.current = false;
        });
    }

    // When we receive list of other users in the room, create peer connections with ALL of them
    socket.on('other-users', (others) => {
      console.log(`Received ${others.length} other user(s) in room. Creating peer connections...`);
      others.forEach((other) => {
        if (!peersRef.current[other.id] && localStreamRef.current) {
          // Create peer connection as initiator (we're joining, they're already there)
          createPeerConnection(other.id, other, true);
        }
      });
    });

    // When a new user joins, create a peer connection with them (we're already in the room)
    socket.on('user-joined', ({ id, name, role }) => {
      console.log(`New user joined: ${name} (${role}) with socket ID ${id}`);
      
      setParticipants(prev => {
        if (prev.some(x => x.id === id)) return prev;
        return [...prev, { 
          id, 
          name, 
          role: role || 'interviewee',
          mic: true, 
          video: true, 
          bgColor: 'bg-blue-500', 
          isLocal: false 
        }];
      });

      // Create peer connection with the newly joined user (we're the initiator since we were here first)
      if (localStreamRef.current && !peersRef.current[id]) {
        createPeerConnection(id, { name, role: role || 'interviewee' }, true);
      }
    });

    // When we receive an offer from another user
    socket.on('offer', (payload) => {
      const { caller, signal } = payload;
      if (!peersRef.current[caller] && localStreamRef.current) {
        // Create peer connection as responder (they initiated)
        const peer = createPeerConnection(caller, { name: 'Guest' }, false);
        if (peer) {
          peer.signal(signal);
        }
      } else if (peersRef.current[caller]) {
        // Update existing peer connection
        peersRef.current[caller].signal(signal);
      }
    });

    // When we receive an answer to our offer
    socket.on('answer', (payload) => {
      const { responder, signal } = payload;
      if (peersRef.current[responder]) {
        peersRef.current[responder].signal(signal);
      }
    });

    socket.on('user-left', (id) => {
      console.log(`User left: ${id}`);
      setParticipants(prev => prev.filter(p => p.id !== id));
      setRemoteStreams(prev => prev.filter(s => s.id !== id));
      if (peersRef.current[id]) {
        try { 
          peersRef.current[id].destroy(); 
        } catch (e) {
          console.error('Error destroying peer:', e);
        }
        delete peersRef.current[id];
      }
    });
    // Clean up
    return () => {
      socket.emit('leave-room', roomId);
      Object.values(peersRef.current).forEach(p => { 
        try { 
          p.destroy(); 
        } catch (e) {
          console.error('Error destroying peer:', e);
        }
      });
      peersRef.current = {};
      
      // Stop local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }
      streamInitializedRef.current = false;
      
      socket.off('other-users');
      socket.off('offer');
      socket.off('answer');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [user?.name, user?.role, roomId, createPeerConnection]); // Include createPeerConnection in dependencies

  // Tabs
  const [activeTab, setActiveTab] = useState('Code Editor');
  // Video
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');

  // Whiteboard (collaborative)
  const [whiteboardData, setWhiteboardData] = useState([]); // [{x1, y1, x2, y2}]

  // Chat (real-time)
  const [messages, setMessages] = useState([]);

  // Listen for media state changes and meeting end
  useEffect(() => {
    socket.on('media-state', ({ id, state }) => {
      setMediaStates(prev => ({ ...prev, [id]: { ...prev[id], ...state } }));
    });
    socket.on('meeting-ended', () => {
      setMeetingEnded(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    });
    return () => {
      socket.off('media-state');
      socket.off('meeting-ended');
    };
  }, [navigate]);

  // --- Real-time logic (WebRTC, chat, whiteboard) ---
  // Removed duplicate getUserMedia call - handled in main useEffect above
  useEffect(() => {
    // Chat: receive
    const handleChatMessage = (msg) => {
      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(m => m.id === msg.id || (m.user === msg.user && m.text === msg.text && m.time === msg.time));
        if (exists) return prev;
        return [...prev, msg];
      });
    };
    
    // Whiteboard: receive
    const handleWhiteboardDraw = (data) => {
      setWhiteboardData(prev => {
        // Prevent duplicate drawings
        const exists = prev.some(d => d.id === data.id || (d.x1 === data.x1 && d.y1 === data.y1 && d.x2 === data.x2 && d.y2 === data.y2));
        if (exists) return prev;
        return [...prev, data];
      });
    };
    
    // Participants: receive (simulate for demo)
    const handleParticipantAdded = (p) => {
      setParticipants(prev => {
        const exists = prev.some(participant => participant.id === p.id || participant.name === p.name);
        if (exists) return prev;
        return [...prev, p];
      });
    };
    
    socket.on('chat-message', handleChatMessage);
    socket.on('whiteboard-draw', handleWhiteboardDraw);
    socket.on('participant-added', handleParticipantAdded);
    
    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('whiteboard-draw', handleWhiteboardDraw);
      socket.off('participant-added', handleParticipantAdded);
    };
  }, []);

  // --- Handlers ---
  // Participants
  const handleAddParticipant = () => {
    if (newParticipantName.trim()) {
      const newP = {
        id: Date.now(),
        name: newParticipantName,
        avatar: newParticipantName.split(' ').map(n => n[0]).join('').toUpperCase(),
        mic: true,
        video: true,
        bgColor: 'bg-blue-500',
        isLocal: false,
      };
      setParticipants(prev => [...prev, newP]);
      socket.emit('participant-added', newP);
      setShowAddModal(false);
      setNewParticipantName('');
    }
  };
  // Chat
  const handleSendMessage = (msg) => {
    const message = { user: 'You', text: msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, message]);
    socket.emit('chat-message', message);
  };
  // Whiteboard
  const handleWhiteboardDraw = (drawData) => {
    setWhiteboardData(prev => [...prev, drawData]);
    socket.emit('whiteboard-draw', drawData);
  };
  // ControlBar handlers
  // Mute logic (only change audio track)
  const handleMute = () => {
    setIsMuted(prevMuted => {
      const newMuted = !prevMuted;
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !newMuted;
        }
      }
      socket.emit('media-state', { id: socket.id, state: { muted: newMuted } });
      return newMuted;
    });
  };

  // Stop Cam logic (only change video track)
  const handleVideo = () => {
    setIsVideoOff(prevVideoOff => {
      const newVideoOff = !prevVideoOff;
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !newVideoOff;
        }
      }
      socket.emit('media-state', { id: socket.id, state: { videoOff: newVideoOff } });
      return newVideoOff;
    });
  };

  // Screen Share logic (preserve audio/video enabled state)
  const handleScreenShare = () => {
    // Update state immediately to prevent multiple clicks
    setIsSharingScreen(prevSharing => {
      const newSharing = !prevSharing;
      
      if (!prevSharing) {
        // Starting screen share
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(screenStream => {
            if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
            
            // Replace tracks in all peer connections using RTCPeerConnection API
            Object.entries(peersRef.current).forEach(([peerId, peer]) => {
              if (peer && !peer.destroyed && peer._pc) {
                try {
                  const pc = peer._pc;
                  const senders = pc.getSenders();
                  const videoTrack = screenStream.getVideoTracks()[0];
                  const audioTrack = screenStream.getAudioTracks()[0];
                  
                  senders.forEach(sender => {
                    if (sender.track) {
                      if (sender.track.kind === 'video' && videoTrack) {
                        sender.replaceTrack(videoTrack).catch(err => 
                          console.warn(`Failed to replace video track for peer ${peerId}:`, err)
                        );
                      } else if (sender.track.kind === 'audio' && audioTrack) {
                        sender.replaceTrack(audioTrack).catch(err => 
                          console.warn(`Failed to replace audio track for peer ${peerId}:`, err)
                        );
                      }
                    }
                  });
                } catch (err) {
                  console.warn(`Error updating peer ${peerId} for screen share:`, err);
                }
              }
            });
            
            localStreamRef.current = screenStream;
            // Set enabled state for tracks independently
            const videoTrack = screenStream.getVideoTracks()[0];
            const audioTrack = screenStream.getAudioTracks()[0];
            if (videoTrack) videoTrack.enabled = !isVideoOff;
            if (audioTrack) audioTrack.enabled = !isMuted;
            setIsPresenting(true);
            socket.emit('media-state', { id: socket.id, state: { isSharingScreen: true } });
            screenStream.getVideoTracks()[0].onended = () => {
              navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(camStream => {
                if (localVideoRef.current) localVideoRef.current.srcObject = camStream;
                
                // Replace tracks back to camera in all peer connections
                Object.entries(peersRef.current).forEach(([peerId, peer]) => {
                  if (peer && !peer.destroyed && peer._pc) {
                    try {
                      const pc = peer._pc;
                      const senders = pc.getSenders();
                      const vTrack = camStream.getVideoTracks()[0];
                      const aTrack = camStream.getAudioTracks()[0];
                      
                      senders.forEach(sender => {
                        if (sender.track) {
                          if (sender.track.kind === 'video' && vTrack) {
                            sender.replaceTrack(vTrack).catch(err => 
                              console.warn(`Failed to replace video track for peer ${peerId}:`, err)
                            );
                          } else if (sender.track.kind === 'audio' && aTrack) {
                            sender.replaceTrack(aTrack).catch(err => 
                              console.warn(`Failed to replace audio track for peer ${peerId}:`, err)
                            );
                          }
                        }
                      });
                    } catch (err) {
                      console.warn(`Error updating peer ${peerId} for camera:`, err);
                    }
                  }
                });
                
                localStreamRef.current = camStream;
                // Set enabled state for tracks independently
                const vTrack = camStream.getVideoTracks()[0];
                const aTrack = camStream.getAudioTracks()[0];
                if (vTrack) vTrack.enabled = !isVideoOff;
                if (aTrack) aTrack.enabled = !isMuted;
                setIsSharingScreen(false);
                setIsPresenting(false);
                socket.emit('media-state', { id: socket.id, state: { isSharingScreen: false } });
              });
            };
          })
          .catch(error => {
            console.error('Error starting screen share:', error);
            // Revert state if error
            setIsSharingScreen(false);
          });
      } else {
        // Stopping screen share
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(camStream => {
            if (localVideoRef.current) localVideoRef.current.srcObject = camStream;
            
            // Replace tracks back to camera in all peer connections
            Object.entries(peersRef.current).forEach(([peerId, peer]) => {
              if (peer && !peer.destroyed && peer._pc) {
                try {
                  const pc = peer._pc;
                  const senders = pc.getSenders();
                  const vTrack = camStream.getVideoTracks()[0];
                  const aTrack = camStream.getAudioTracks()[0];
                  
                  senders.forEach(sender => {
                    if (sender.track) {
                      if (sender.track.kind === 'video' && vTrack) {
                        sender.replaceTrack(vTrack).catch(err => 
                          console.warn(`Failed to replace video track for peer ${peerId}:`, err)
                        );
                      } else if (sender.track.kind === 'audio' && aTrack) {
                        sender.replaceTrack(aTrack).catch(err => 
                          console.warn(`Failed to replace audio track for peer ${peerId}:`, err)
                        );
                      }
                    }
                  });
                } catch (err) {
                  console.warn(`Error updating peer ${peerId} for camera:`, err);
                }
              }
            });
            
            localStreamRef.current = camStream;
            // Set enabled state for tracks independently
            const vTrack = camStream.getVideoTracks()[0];
            const aTrack = camStream.getAudioTracks()[0];
            if (vTrack) vTrack.enabled = !isVideoOff;
            if (aTrack) aTrack.enabled = !isMuted;
            setIsPresenting(false);
            socket.emit('media-state', { id: socket.id, state: { isSharingScreen: false } });
          })
          .catch(error => {
            console.error('Error stopping screen share:', error);
            // Revert state if error
            setIsSharingScreen(true);
          });
      }
      
      return newSharing;
    });
  };

  // Recording logic
  const handleRecord = () => {
    // Update state immediately to prevent multiple clicks
    setIsRecording(prevRecording => {
      const newRecording = !prevRecording;
      
      if (!prevRecording) {
        // Starting recording
        if (localStreamRef.current) {
          try {
            const mediaRecorder = new window.MediaRecorder(localStreamRef.current, { mimeType: 'video/webm; codecs=vp8' });
            mediaRecorderRef.current = mediaRecorder;
            const chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `meeting_recording_${Date.now()}.webm`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };
            mediaRecorder.start();
            setRecordingChunks(chunks);
            socket.emit('media-state', { id: socket.id, state: { isRecording: true } });
          } catch (error) {
            console.error('Error starting recording:', error);
            // Revert state if error
            return false;
          }
        }
      } else {
        // Stopping recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          socket.emit('media-state', { id: socket.id, state: { isRecording: false } });
        }
      }
      
      return newRecording;
    });
  };

  const handleEndMeeting = () => {
    socket.emit('meeting-ended');
    setMeetingEnded(true);
    setTimeout(() => navigate('/dashboard'), 3000);
  };

  // Tab visibility / focus change monitoring - throttled to prevent excessive logging
  useEffect(() => {
    if (!user) return;
    
    const participant = user.name || '';
    const interviewId = null;
    let lastVisibilityLog = 0;
    let lastBlurLog = 0;
    let lastFocusLog = 0;
    const THROTTLE_MS = 5000; // Log at most once every 5 seconds
    
    const onVisibility = () => {
      const now = Date.now();
      if (document.hidden && now - lastVisibilityLog > THROTTLE_MS) {
        lastVisibilityLog = now;
        logMonitoringEvent({ type: 'TabSwitch', severity: 'warning', details: `Room ${roomId}: tab hidden`, participant, interviewId });
      } else if (!document.hidden && now - lastVisibilityLog > THROTTLE_MS) {
        lastVisibilityLog = now;
        logMonitoringEvent({ type: 'Focus', severity: 'info', details: `Room ${roomId}: tab visible`, participant, interviewId });
      }
    };
    
    const onBlur = () => {
      const now = Date.now();
      if (now - lastBlurLog > THROTTLE_MS) {
        lastBlurLog = now;
        logMonitoringEvent({ type: 'WindowBlur', severity: 'warning', details: `Room ${roomId}: window blur`, participant, interviewId });
      }
    };
    
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusLog > THROTTLE_MS) {
        lastFocusLog = now;
        logMonitoringEvent({ type: 'WindowFocus', severity: 'info', details: `Room ${roomId}: window focus`, participant, interviewId });
      }
    };
    
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [roomId, user?.name]); // Only depend on user.name, not the whole user object

  // --- Render ---
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <InterviewHeader />
      {meetingEnded && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"><div className="bg-white text-black p-8 rounded-lg text-2xl font-bold">Meeting Ended</div></div>}
      <div className="flex flex-1">
        <Sidebar role="user" />
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Interview Header Details */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Senior Frontend Developer Interview</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-400 text-sm">
                <span>Internal</span>
                <span>📅 July 25, 2025</span>
                <span>🕐 10:00 - 11:30 AM</span>
                </div>
              </div>
          </div>
          {/* Add Participant Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-dark-card p-6 rounded-lg shadow-lg flex flex-col gap-4 w-80">
                <h2 className="text-lg font-bold">Add Participant</h2>
                <input
                  className="p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
                  placeholder="Full Name"
                  value={newParticipantName}
                  onChange={e => setNewParticipantName(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="px-4 py-2 rounded bg-primary text-white font-semibold" onClick={handleAddParticipant}>Add</button>
              </div>
            </div>
            </div>
          )}
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Section - Videos (Below Title, Left Aligned) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0">
              <div className="flex flex-col items-start gap-3">
                {/* Interviewee Video (Main Video) - Left Aligned */}
                <VideoSection
                  localVideoRef={localVideoRef}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  remoteStreams={remoteStreams.filter(s => s.role !== 'interviewer')} // Exclude interviewer from thumbnails
                  overlays={mediaStates}
                  isPresenting={isPresenting}
                  faceDetected={faceDetected}
                  eyeTracking={eyeTracking}
                  attentionScore={attentionScore}
                  canvasRef={canvasRef}
                  showRemoteStreams={false} // Hide remote stream thumbnails to save space
                  compactMode={true} // Enable compact mode
                  key="video-section" // Stable key to prevent unnecessary remounts
                />
                
                {/* Interviewer Video Section - Directly Below Interviewee */}
                <InterviewerVideoSection
                  interviewerStream={interviewerStream?.stream || null}
                  interviewerName={interviewerName}
                  isMuted={interviewerMediaState.muted || false}
                  isVideoOff={interviewerMediaState.videoOff || false}
                  compactMode={true} // Enable compact mode
                  key="interviewer-video-section"
                />
              </div>
            </div>
            {/* Center Section - Code Editor/Whiteboard */}
            <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
              <div className="bg-dark-card rounded-lg h-full flex flex-col overflow-hidden">
                <div className="flex border-b border-border-color">
                  <button
                    onClick={() => setActiveTab('Code Editor')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'Code Editor' ? 'text-white border-b-2 border-primary' : 'text-gray-text hover:text-white'}`}
                  >
                    Code Editor
                  </button>
                  <button
                    onClick={() => setActiveTab('Whiteboard')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'Whiteboard' ? 'text-white border-b-2 border-primary' : 'text-gray-text hover:text-white'}`}
                  >
                    Whiteboard
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'Code Editor' ? (
                    <CodeEditor socket={socket} roomId={roomId} />
                  ) : (
                    <Whiteboard socket={socket} roomId={roomId} />
                  )}
                </div>
              </div>
            </div>
            {/* Right Section - Participants & Chat */}
            <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
              {/* Attention Tracker */}
              <AttentionTracker 
                attentionScore={attentionScore}
                eyeTracking={eyeTracking}
                faceDetected={faceDetected}
                key="attention-tracker" // Stable key to prevent unnecessary remounts
              />
              <ParticipantsPanel
                participants={participants}
                setParticipants={setParticipants}
                roomId={roomId}
                socket={socket}
                onAdd={() => setShowAddModal(true)}
              />
              <ChatPanel
                messages={messages}
                onSend={handleSendMessage}
              />
            </div>
          </div>
        </main>
      </div>
      {/* Live Captions */}
      <LiveCaptions stream={localStreamRef.current} enabled={liveCaptionsEnabled} />
      {/* Control Bar (Fixed at bottom) */}
      <div className="border-t border-border-color bg-dark-card py-3 px-6 flex justify-center">
        <ControlBar
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isSharingScreen={isSharingScreen}
          isRecording={isRecording}
          liveCaptionsEnabled={liveCaptionsEnabled}
          onMute={handleMute}
          onVideo={handleVideo}
          onScreenShare={handleScreenShare}
          onRecord={handleRecord}
          onEndMeeting={handleEndMeeting}
          onToggleCaptions={() => setLiveCaptionsEnabled(!liveCaptionsEnabled)}
        />
      </div>
      <Footer />
    </div>
  );
};

export default InterviewLayout;