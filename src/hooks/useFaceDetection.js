import { useState, useEffect, useRef } from 'react';
import { logMonitoringEvent } from '../utils/monitoringClient';
import {
  calculateHeadPose,
  calculateGazeDirection,
  calculateFaceQuality,
  calculateEnhancedAttentionScore,
  KalmanFilter,
  AdaptiveEARCalibration,
  validateHumanFace,
  detectCameraCovered,
} from '../utils/faceDetectionML';

const useFaceDetection = (videoRef) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeTracking, setEyeTracking] = useState({ leftEye: false, rightEye: false });
  const [attentionScore, setAttentionScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectorRef = useRef(null);
  const faceLostTimerRef = useRef(null);
  const attentionHistoryRef = useRef([]);
  const lastUpdateTimeRef = useRef(Date.now());
  const lastCanvasDrawRef = useRef(0);
  const lastStateRef = useRef({ faceDetected: false, eyeTracking: { leftEye: false, rightEye: false }, attentionScore: 0 });
  
  // Advanced ML components
  const kalmanFilterRef = useRef(new KalmanFilter(0.01, 0.25));
  const earCalibrationRef = useRef(new AdaptiveEARCalibration());
  const videoDimensionsRef = useRef({ width: 640, height: 480 });
  const lastCameraCheckRef = useRef(0);
  const cameraCoveredCacheRef = useRef({ isCovered: false, timestamp: 0 });

  useEffect(() => {
    let mounted = true;
    let initTimeout;

    const initializeFaceDetection = async () => {
      try {
        console.log('🎯 Initializing advanced face detection...');
        setIsProcessing(true);

        // Set a timeout for initialization
        initTimeout = setTimeout(() => {
          if (!detectorRef.current && mounted) {
            console.error('❌ TensorFlow loading timeout - Face detection will not work until TensorFlow loads');
            setIsInitialized(false);
            setIsProcessing(false);
            // Do NOT start simulation mode - require real detection
          }
        }, 10000); // 10 second timeout (increased for slower connections)

        // Load TensorFlow.js and Face Landmarks Detection
        console.log('📦 Loading TensorFlow.js and face-landmarks-detection...');
        const [tf, faceLandmarksDetection] = await Promise.all([
          import('@tensorflow/tfjs'),
          import('@tensorflow-models/face-landmarks-detection')
        ]);
        console.log('✅ TensorFlow.js loaded:', tf.version);
        console.log('✅ Face landmarks detection loaded');

        // Set backend and wait for it to be ready
        console.log('🔧 Setting TensorFlow.js backend to WebGL...');
        try {
          await tf.setBackend('webgl');
          await tf.ready();
          console.log('✅ TensorFlow.js ready with WebGL backend');
          console.log('✅ Backend info:', {
            backend: tf.getBackend(),
            webglVersion: tf.env().get('WEBGL_VERSION'),
            hasWebGL: tf.env().get('WEBGL_VERSION') !== 0
          });
        } catch (backendError) {
          console.warn('⚠️ WebGL backend failed, trying CPU backend...', backendError);
          await tf.setBackend('cpu');
          await tf.ready();
          console.log('✅ TensorFlow.js ready with CPU backend (slower but should work)');
        }

        // Create detector with optimized settings for maximum accuracy
        // Try MediaPipe runtime first (more reliable), fallback to tfjs if needed
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        
        console.log('🔧 Creating face detector...');
        console.log('🔧 Model:', model);
        console.log('🔧 Available models:', Object.keys(faceLandmarksDetection.SupportedModels));
        
        // Create detector with tfjs runtime
        // Start with refineLandmarks: false for better compatibility
        console.log('🔧 Creating detector with tfjs runtime...');
        let detector;
        let detectorConfig = {
          runtime: 'tfjs',
          refineLandmarks: false, // Start with false for better compatibility
          maxFaces: 1,
        };
        
        try {
          detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
          console.log('✅ Detector created successfully (without refined landmarks)');
        } catch (detectorError) {
          console.error('❌ Failed to create detector:', detectorError);
          console.error('❌ Error details:', {
            message: detectorError.message,
            name: detectorError.name,
            stack: detectorError.stack?.substring(0, 300)
          });
          throw detectorError;
        }
        
        // Verify detector has the required method
        if (!detector || typeof detector.estimateFaces !== 'function') {
          console.error('❌ Detector is missing estimateFaces method!', detector);
          throw new Error('Detector initialization failed - missing estimateFaces method');
        }
        
        console.log('✅ Detector verification passed - estimateFaces method exists');
        
        detectorRef.current = detector;
        console.log('✅ Detector stored in ref:', !!detectorRef.current);
        console.log('✅ Detector methods available:', Object.keys(detector || {}));
        console.log('✅ Detector estimateFaces type:', typeof detector?.estimateFaces);
        clearTimeout(initTimeout);
        
        // Test the detector immediately with video if available (diagnostic)
        if (videoRef?.current) {
          const testVideo = videoRef.current;
          if (testVideo.videoWidth > 0 && testVideo.videoHeight > 0) {
            console.log('🧪 Testing detector with current video...');
            try {
              const testResult = await detector.estimateFaces(testVideo, { flipHorizontal: false });
              console.log('🧪 Test detection result:', {
                found: testResult?.length || 0,
                isArray: Array.isArray(testResult),
                result: testResult
              });
            } catch (testError) {
              console.error('❌ Test detection failed:', testError);
            }
          }
        }

        if (mounted) {
          console.log('✅ Face detector initialized successfully');
          setIsInitialized(true);
          setIsProcessing(false);
          
          // Wait for video to be ready, then start detection
          const checkVideoAndStart = () => {
            if (!mounted || !detectorRef.current) return;
            
            const video = videoRef?.current;
            if (video && video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
              console.log('✅ Video is ready, starting detection');
              console.log('✅ Video info:', {
                width: video.videoWidth,
                height: video.videoHeight,
                readyState: video.readyState,
                hasStream: !!video.srcObject
              });
              startRealTimeDetection();
            } else {
              console.log('⏳ Waiting for video to be ready...', {
                videoExists: !!video,
                width: video?.videoWidth || 0,
                height: video?.videoHeight || 0,
                readyState: video?.readyState || 0
              });
              // Check again in 500ms
              setTimeout(checkVideoAndStart, 500);
            }
          };
          
          // Start checking after a short delay
          setTimeout(checkVideoAndStart, 500);
        }
      } catch (error) {
        console.error('❌ Error initializing face detection:', error);
        clearTimeout(initTimeout);
        if (mounted) {
          setIsProcessing(false);
          setIsInitialized(false); // Do NOT enable simulation - require real detection
          // Do NOT start simulation mode - this prevents false positives
        }
      }
    };

    // DISABLED: Simulation mode removed to prevent false positives
    // The system will ONLY work with real face detection - no simulated data
    const startSimulationMode = () => {
      console.warn('⚠️ Simulation mode is DISABLED to prevent false positives. Real face detection required.');
      // Do NOT start simulation - require real face detection
      // This ensures 100% accuracy - no false positives from simulated data
      if (mounted) {
        setIsInitialized(false);
        setIsProcessing(false);
        // Set state to show no face detected
        setFaceDetected(false);
        setEyeTracking({ leftEye: false, rightEye: false });
        setAttentionScore(0);
      }
    };

    const startRealTimeDetection = () => {
      console.log('🎥 Starting real-time face detection...');
      console.log('📹 Video ref:', videoRef?.current);
      console.log('📹 Video element:', videoRef?.current ? 'exists' : 'missing');
      console.log('🔍 Detector ref:', detectorRef.current ? 'exists' : 'missing');
      
      let frameCount = 0;
      let videoReadyLogged = false;
      let consecutiveFailures = 0;
      let lastDetectionLog = 0;
      let initializationChecked = false;

      const detect = async () => {
        if (!mounted) {
          return;
        }
        
        // Check if detector is available
        if (!detectorRef.current) {
          if (!initializationChecked) {
            console.error('❌ Detector not available! Initialization may have failed.');
            initializationChecked = true;
          }
          if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        // Check if video ref and element are available
        if (!videoRef?.current) {
          if (frameCount % 180 === 0) {
            console.error('❌ Video ref not available!');
          }
          if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

      const video = videoRef.current;
      
      // Verify video element is actually an HTMLVideoElement
      if (!(video instanceof HTMLVideoElement)) {
        if (frameCount % 180 === 0) {
          console.error('❌ Video ref is not an HTMLVideoElement!', video);
        }
        if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      
      // Ensure video is playing (CRITICAL for face detection to work)
      if (video.paused) {
        try {
          video.muted = true; // Mute to allow autoplay
          video.playsInline = true; // Allow inline playback on mobile
          await video.play();
          console.log('✅ Video play() called successfully');
        } catch (playError) {
          console.warn('⚠️ Video play() failed (might be autoplay restrictions):', playError.message);
          // Try to play without await (fire and forget)
          video.play().catch(() => {});
        }
      }

        // Wait for video to be ready and playing
        // Video must be in a "playing" state with valid dimensions
        if (video.readyState < 2) {
          if (frameCount % 180 === 0) {
            console.log('⏳ Waiting for video metadata. Ready state:', video.readyState);
          }
          if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          if (frameCount % 180 === 0) {
            console.log('⏳ Waiting for video dimensions. Current:', video.videoWidth, 'x', video.videoHeight);
          }
          if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        // Log when video is ready (once)
        if (!videoReadyLogged) {
          console.log('✅ Video ready:', video.videoWidth, 'x', video.videoHeight, 'Ready state:', video.readyState);
          console.log('✅ Detector available:', detectorRef.current ? 'Yes' : 'No');
          videoReadyLogged = true;
        }

        frameCount++;
        
        // Skip frames to reduce processing - detect every 3rd frame (~20fps instead of 60fps)
        // This significantly reduces CPU usage and flickering
        if (frameCount % 3 !== 0) {
          if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
          return;
        }

        try {
          // Detect faces with high precision
          // Make sure video element is valid and has video data
          if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
            if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
            return;
          }
          
          // Check if detector is available
          if (!detectorRef.current) {
            if (frameCount % 180 === 0) {
              console.error('❌ Detector not initialized!');
            }
            if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
            return;
          }
          
          // Log detection attempt for debugging
          if (frameCount % 180 === 0 && frameCount > 0) {
            console.log('🔍 Attempting face detection...', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              detector: detectorRef.current ? 'available' : 'missing'
            });
          }
          
          // Use video element directly for detection
          // TensorFlow.js face-landmarks-detection supports HTMLVideoElement
          let predictions = [];
          
          try {
            // Verify video has a stream and valid dimensions
            if (!video.srcObject && !video.src) {
              if (frameCount % 180 === 0) {
                console.warn('⚠️ Video element has no stream (srcObject or src)');
              }
              predictions = [];
            } else if (video.videoWidth === 0 || video.videoHeight === 0) {
              if (frameCount % 180 === 0) {
                console.warn('⚠️ Video has zero dimensions:', video.videoWidth, 'x', video.videoHeight);
              }
              predictions = [];
            } else {
              // Perform face detection using canvas (most reliable method)
              try {
                // Create a canvas and draw the current video frame
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw video frame to canvas (original orientation)
                // Note: Video display is mirrored, but detection uses original
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Perform face detection on canvas
                const detectionResult = await detectorRef.current.estimateFaces(canvas, {
                  flipHorizontal: false,
                });
                
                // Handle the result - should always be an array
                if (Array.isArray(detectionResult)) {
                  predictions = detectionResult;
                } else if (detectionResult) {
                  // Single result object, convert to array
                  predictions = [detectionResult];
                } else {
                  predictions = [];
                }
                
                // Log detection results for debugging
                if (frameCount % 180 === 0) {
                  console.log('🔍 Face detection call completed:', {
                    predictionsCount: predictions.length,
                    videoSize: `${video.videoWidth}x${video.videoHeight}`,
                    canvasSize: `${canvas.width}x${canvas.height}`,
                    resultType: typeof detectionResult,
                    isArray: Array.isArray(detectionResult)
                  });
                  
                  if (predictions.length > 0) {
                    console.log('✅ Face found!', {
                      hasBox: !!predictions[0].box,
                      keypointsCount: predictions[0].keypoints?.length || 0
                    });
                  }
                }
              } catch (detectError) {
                // Log error but don't break the detection loop
                if (frameCount % 60 === 0) {
                  console.error('❌ Face detection error:', {
                    message: detectError.message,
                    name: detectError.name,
                    videoReady: video.readyState,
                    videoDimensions: `${video.videoWidth}x${video.videoHeight}`
                  });
                }
                predictions = [];
              }
            }
          } catch (detectionError) {
            // Log detailed error for debugging
            console.error('❌ Face detection error:', {
              message: detectionError.message,
              name: detectionError.name,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              videoReadyState: video.readyState,
              videoPaused: video.paused,
              hasSrcObject: !!video.srcObject,
              hasSrc: !!video.src,
              detectorExists: !!detectorRef.current
            });
            predictions = [];
          }

          // Log prediction results for debugging (every 2 seconds for better visibility)
          const currentTime = Date.now();
          if (currentTime - lastDetectionLog > 2000) {
            lastDetectionLog = currentTime;
            const predictionCount = predictions ? predictions.length : 0;
            
            if (predictionCount > 0) {
              // Face detected - log success
              const face = predictions[0];
              console.log('✅ FACE DETECTED!', {
                count: predictionCount,
                hasBox: !!face.box,
                keypoints: face.keypoints?.length || 0,
                box: face.box ? {
                  x: Math.round(face.box.xMin),
                  y: Math.round(face.box.yMin),
                  w: Math.round(face.box.xMax - face.box.xMin),
                  h: Math.round(face.box.yMax - face.box.yMin)
                } : 'none'
              });
            } else {
              // No face detected - log diagnostic info
              console.warn('⚠️ NO FACE DETECTED', {
                videoDimensions: `${video.videoWidth}x${video.videoHeight}`,
                videoReadyState: video.readyState,
                videoPaused: video.paused,
                videoVisible: video.offsetWidth > 0 && video.offsetHeight > 0,
                hasVideoStream: !!video.srcObject,
                detectorAvailable: !!detectorRef.current,
                consecutiveFailures: consecutiveFailures,
                suggestions: [
                  '1. Ensure face is clearly visible in frame',
                  '2. Check lighting conditions',
                  '3. Ensure camera permissions are granted',
                  '4. Try moving closer to camera',
                  '5. Check if video is actually playing'
                ]
              });
            }
          }

          if (predictions && predictions.length > 0) {
            const face = predictions[0];
            const currentTime = Date.now(); // Declare once at the start of the block
            
            // VALIDATION STEP 0: Check face detection confidence/probability (if available)
            // MediaPipe might not always provide probability, so we're lenient here
            let faceConfidence = 1.0; // Default to high confidence if not provided
            if (face.probability !== undefined) {
              faceConfidence = face.probability;
            } else if (face.box && face.box.probability !== undefined) {
              faceConfidence = face.box.probability;
            }
            
            // Only reject if confidence is explicitly provided and very low
            // MediaPipe Face Mesh often doesn't provide probability, so we don't reject based on it alone
            if (faceConfidence !== 1.0 && faceConfidence < 0.5) {
              // Very low confidence detection - reject only if explicitly low
              consecutiveFailures++;
              if (frameCount % 180 === 0) {
                console.log('🚫 Very low detection confidence - Rejecting:', faceConfidence);
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Log detection success for debugging
            if (frameCount % 180 === 0) {
              console.log('✅ Face detected - Confidence:', faceConfidence, 'Keypoints:', face.keypoints?.length || 0);
            }
            
            // Update video dimensions for accurate calculations
            if (video.videoWidth && video.videoHeight) {
              videoDimensionsRef.current = {
                width: video.videoWidth,
                height: video.videoHeight,
              };
            }

            // STRICT VALIDATION STEP 1: Check if camera is covered (shutter closed)
            // Only check every 30 frames (~1 second) to optimize performance
            let cameraCovered = cameraCoveredCacheRef.current;
            if (currentTime - lastCameraCheckRef.current > 1000) {
              lastCameraCheckRef.current = currentTime;
              cameraCovered = detectCameraCovered(video, face);
              cameraCoveredCacheRef.current = { ...cameraCovered, timestamp: currentTime };
            }
            
            if (cameraCovered.isCovered && cameraCovered.confidence > 0.5) {
              // Camera is covered - reject detection
              consecutiveFailures++;
              kalmanFilterRef.current.update(0); // Reset filter
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              if (frameCount % 180 === 0) {
                console.log('🚫 Camera covered - Rejecting detection', { brightness: cameraCovered.brightness, variance: cameraCovered.variance });
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }

            // STRICT VALIDATION STEP 2: Validate if it's actually a human face
            const faceValidation = validateHumanFace(face, face.keypoints);
            if (!faceValidation.isValid) {
              // Not a valid human face - reject
              consecutiveFailures++;
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              if (frameCount % 180 === 0) {
                console.log('🚫 Invalid face - Rejecting:', faceValidation.reason);
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }

            // STRICT VALIDATION STEP 3: Calculate face quality
            const faceQuality = calculateFaceQuality(
              face,
              face.keypoints,
              videoDimensionsRef.current.width,
              videoDimensionsRef.current.height
            );

            // Reject if face quality is very poor (lowered threshold for real-world use)
            if (!faceQuality.isValid || faceQuality.score < 40) {
              consecutiveFailures++;
              if (frameCount % 180 === 0) {
                console.log('🚫 Poor face quality - Rejecting:', faceQuality.score, 'Factors:', faceQuality.factors);
              }
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Log quality for debugging
            if (frameCount % 180 === 0) {
              console.log('✅ Face quality passed:', faceQuality.score, 'Valid:', faceQuality.isValid);
            }

            // Calculate head pose (yaw, pitch, roll)
            const headPose = calculateHeadPose(
              face.keypoints,
              videoDimensionsRef.current.width,
              videoDimensionsRef.current.height
            );

            // VALIDATION STEP 4: Reject if head is turned too far (more lenient: 30°/25°/25°)
            if (Math.abs(headPose.yaw) > 30 || Math.abs(headPose.pitch) > 25 || Math.abs(headPose.roll) > 25) {
              consecutiveFailures++;
              if (frameCount % 180 === 0) {
                console.log('🚫 Head turned too far - Rejecting:', `Yaw: ${headPose.yaw.toFixed(1)}°, Pitch: ${headPose.pitch.toFixed(1)}°, Roll: ${headPose.roll.toFixed(1)}°`);
              }
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }

            // VALIDATION STEP 5: Head pose confidence (more lenient: 0.5)
            if (headPose.confidence < 0.5) {
              consecutiveFailures++;
              if (frameCount % 180 === 0) {
                console.log('🚫 Low head pose confidence - Rejecting:', headPose.confidence);
              }
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Log head pose for debugging
            if (frameCount % 180 === 0) {
              console.log('✅ Head pose valid:', `Yaw: ${headPose.yaw.toFixed(1)}°, Pitch: ${headPose.pitch.toFixed(1)}°, Roll: ${headPose.roll.toFixed(1)}°, Confidence: ${headPose.confidence.toFixed(2)}`);
            }

            // All validations passed - proceed with detection
            consecutiveFailures = 0; // Reset failure counter

            // Calculate precise eye openness using landmark positions
            const eyeData = calculateEyeOpenness(face.keypoints);
            
            // STRICT VALIDATION STEP 6: Both eyes must be detectable
            if (eyeData.leftEAR === 0 && eyeData.rightEAR === 0) {
              consecutiveFailures++;
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (frameCount % 180 === 0) {
                console.log('🚫 Eyes not detectable - Rejecting');
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Add EAR samples for calibration (only if valid)
            if (eyeData.leftEAR > 0 && eyeData.rightEAR > 0) {
              earCalibrationRef.current.addSample(eyeData.leftEAR, eyeData.rightEAR);
            }
            
            // Calculate gaze direction
            const gazeDirection = calculateGazeDirection(face.keypoints, headPose);
            
            // Get calibrated EAR thresholds
            const calibrationData = earCalibrationRef.current.getThresholds();
            
            // Calculate enhanced attention score with STRICT validation
            const rawScore = calculateEnhancedAttentionScore(
              face,
              eyeData,
              headPose,
              gazeDirection,
              faceQuality,
              calibrationData,
              faceValidation.isValid
            );
            
            // STRICT: If score is 0, reject detection
            if (rawScore === 0) {
              consecutiveFailures++;
              updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
              if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              if (frameCount % 180 === 0) {
                console.log('🚫 Attention score too low - Rejecting:', rawScore);
              }
              if (mounted) animationFrameRef.current = requestAnimationFrame(detect);
              return;
            }
            
            // Apply Kalman filter for smooth predictions
            const smoothedScore = kalmanFilterRef.current.update(rawScore);
            
            // Update state with enhanced data (only if all validations passed)
            updateDetectionState(true, eyeData, Math.round(smoothedScore), {
              headPose,
              gazeDirection,
              faceQuality,
              isValid: true,
            });

            // Draw enhanced visualization on canvas (throttled to reduce flickering)
            if (canvasRef.current && (currentTime - lastCanvasDrawRef.current > 33)) { // ~30fps for canvas
              lastCanvasDrawRef.current = currentTime;
              drawEnhancedFaceVisualization(face, video, eyeData, headPose, gazeDirection);
            }

            // Log every 180 frames (about once per 3 seconds at 60fps)
            if (frameCount % 180 === 0) {
              console.log('👤 Face detected - Enhanced Score:', Math.round(smoothedScore), 
                'Raw:', rawScore, 
                'Eyes:', eyeData.leftEye ? 'L✓' : 'L✗', eyeData.rightEye ? 'R✓' : 'R✗',
                'Head Pose:', `Y:${headPose.yaw.toFixed(1)} P:${headPose.pitch.toFixed(1)} R:${headPose.roll.toFixed(1)}`,
                'Gaze:', `X:${gazeDirection.x.toFixed(2)} Y:${gazeDirection.y.toFixed(2)}`,
                'Quality:', faceQuality.score);
            }
        } else {
            consecutiveFailures++;
          
          // Only update state after multiple consecutive failures to reduce flickering
          // This allows for temporary frame drops (e.g., quick head movements, blinks)
          if (consecutiveFailures > 10) {
            // Reset Kalman filter when face is lost for extended period
            kalmanFilterRef.current.update(0);
            
            // Update state to show no face detected
            updateDetectionState(false, { leftEye: false, rightEye: false }, 0);
            
            // Clear canvas when no face detected to prevent flickering
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
            
            // Log less frequently when no face
            if (frameCount % 180 === 0) {
              console.log('❌ No face detected - Video:', video.videoWidth, 'x', video.videoHeight, 'Ready:', video.readyState, 'Consecutive failures:', consecutiveFailures);
            }

            // Do NOT switch to simulation mode - keep trying real detection
            // This ensures accuracy and prevents false positives
            if (consecutiveFailures > 300 && mounted) {
              console.warn('⚠️ Too many detection failures - Continuing to attempt real face detection');
              // Continue detection loop - do not switch to simulation
            }
          }
        } catch (error) {
          consecutiveFailures++;
          // Log all errors for debugging
          if (frameCount % 60 === 0) { // Log errors more frequently for debugging
            console.error('❌ Face detection error:', {
              message: error.message,
              stack: error.stack,
              failures: consecutiveFailures,
              videoReady: video ? video.readyState : 'no video',
              detectorReady: detectorRef.current ? 'yes' : 'no'
            });
          }

          // Do NOT switch to simulation mode - keep trying real detection
          if (consecutiveFailures > 300 && mounted) {
            console.warn('⚠️ Too many detection errors - Continuing to attempt real face detection');
            // Continue detection loop - do not switch to simulation
          }
        }

        if (mounted) {
          animationFrameRef.current = requestAnimationFrame(detect);
        }
      };

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    /**
     * Calculate eye openness using Eye Aspect Ratio (EAR)
     * More accurate than simple heuristics with adaptive calibration
     */
    const calculateEyeOpenness = (keypoints) => {
      if (!keypoints || keypoints.length < 468) {
        return { leftEye: false, rightEye: false, leftEAR: 0, rightEAR: 0 };
      }

      // MediaPipe Face Mesh landmark indices for eyes
      // Left eye: 33, 160, 158, 133, 153, 144
      // Right eye: 362, 385, 387, 263, 373, 380
      
      const leftEyeIndices = {
        top: 159,
        bottom: 145,
        left: 33,
        right: 133,
        topInner: 158,
        bottomInner: 153
      };

      const rightEyeIndices = {
        top: 386,
        bottom: 374,
        left: 362,
        right: 263,
        topInner: 387,
        bottomInner: 373
      };

      // Calculate Eye Aspect Ratio (EAR) for left and right eyes
      const leftEAR = calculateEAR(keypoints, leftEyeIndices);
      const rightEAR = calculateEAR(keypoints, rightEyeIndices);

      // Use adaptive thresholds from calibration, or default
      let leftThreshold = 0.15;
      let rightThreshold = 0.15;
      
      try {
        const calibrationData = earCalibrationRef.current?.getThresholds();
        if (calibrationData) {
          leftThreshold = calibrationData.leftEARThreshold || 0.15;
          rightThreshold = calibrationData.rightEARThreshold || 0.15;
        }
      } catch (error) {
        // Use default thresholds if calibration not available
        console.warn('Calibration not available, using default thresholds');
      }
    
      return { 
        leftEye: leftEAR > leftThreshold,
        rightEye: rightEAR > rightThreshold,
        leftEAR: leftEAR,
        rightEAR: rightEAR,
        leftThreshold,
        rightThreshold,
      };
    };

    /**
     * Calculate Eye Aspect Ratio (EAR)
     * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
     */
    const calculateEAR = (keypoints, indices) => {
      try {
        const p1 = keypoints[indices.left];
        const p2 = keypoints[indices.top];
        const p3 = keypoints[indices.topInner];
        const p4 = keypoints[indices.right];
        const p5 = keypoints[indices.bottomInner];
        const p6 = keypoints[indices.bottom];

        // Calculate distances
        const vertical1 = euclideanDistance(p2, p6);
        const vertical2 = euclideanDistance(p3, p5);
        const horizontal = euclideanDistance(p1, p4);

        // Calculate EAR
        const ear = (vertical1 + vertical2) / (2.0 * horizontal);
        return ear;
      } catch (error) {
        return 0;
      }
    };

    /**
     * Calculate Euclidean distance between two points
     */
    const euclideanDistance = (point1, point2) => {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      const dz = (point1.z || 0) - (point2.z || 0);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    /**
     * Calculate comprehensive attention score
     */
    const calculateAttentionScore = (face, eyeData) => {
      let score = 0;

      // Base score for face detection (40 points)
      score += 40;

      // Eye openness (30 points each eye)
      if (eyeData.leftEye) score += 30;
      if (eyeData.rightEye) score += 30;

      // Bonus for both eyes open (10 points)
      if (eyeData.leftEye && eyeData.rightEye) {
        score += 10;
      }

      // Face position and orientation (bonus/penalty)
      if (face.box) {
        const box = face.box;
        const centerX = (box.xMin + box.xMax) / 2;
        const centerY = (box.yMin + box.yMax) / 2;
        
        // Assuming video dimensions
        const videoCenterX = videoRef.current?.videoWidth / 2 || 320;
        const videoCenterY = videoRef.current?.videoHeight / 2 || 240;
        
        // Calculate deviation from center
        const deviationX = Math.abs(centerX - videoCenterX) / videoCenterX;
        const deviationY = Math.abs(centerY - videoCenterY) / videoCenterY;
        
        // Penalty for being off-center (max -10 points)
        const positionPenalty = Math.min(10, (deviationX + deviationY) * 10);
        score -= positionPenalty;
      }

      // Eye aspect ratio quality (bonus for wide-open eyes)
      if (eyeData.leftEAR > 0.25) score += 5;
      if (eyeData.rightEAR > 0.25) score += 5;

      // Ensure score is within 0-100
      return Math.max(0, Math.min(100, Math.round(score)));
    };

    /**
     * Draw enhanced face visualization with head pose and gaze direction
     */
    const drawEnhancedFaceVisualization = (face, video, eyeData, headPose, gazeDirection) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding box with color based on attention
      if (face.box) {
        const box = face.box;
        // Color based on head pose and gaze
        let boxColor = '#00ff00'; // Green - good attention
        if (Math.abs(headPose.yaw) > 20 || Math.abs(headPose.pitch) > 15) {
          boxColor = '#ffaa00'; // Orange - moderate attention
        }
        if (Math.abs(headPose.yaw) > 35 || Math.abs(headPose.pitch) > 25 || Math.abs(gazeDirection.x) > 0.5) {
          boxColor = '#ff0000'; // Red - poor attention
        }
        
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(box.xMin, box.yMin, box.xMax - box.xMin, box.yMax - box.yMin);
      }

      // Draw head pose indicators
      if (face.keypoints && face.keypoints.length >= 468) {
        const noseTip = face.keypoints[4];
        const centerX = noseTip.x;
        const centerY = noseTip.y;

        // Draw yaw indicator (horizontal line)
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY);
        ctx.lineTo(centerX + 30 + (headPose.yaw / 45) * 30, centerY);
        ctx.stroke();

        // Draw pitch indicator (vertical line)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 30);
        ctx.lineTo(centerX, centerY + 30 + (headPose.pitch / 30) * 30);
        ctx.stroke();

        // Draw gaze direction vector
        if (gazeDirection.confidence > 0.5) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + gazeDirection.x * 50,
            centerY + gazeDirection.y * 50
          );
          ctx.stroke();
        }

        // Draw eye landmarks with enhanced colors
        const leftEyeIndices = [33, 160, 158, 133, 153, 144];
        ctx.fillStyle = eyeData.leftEye ? '#00ff00' : '#ff0000';
        leftEyeIndices.forEach(idx => {
          const point = face.keypoints[idx];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        const rightEyeIndices = [362, 385, 387, 263, 373, 380];
        ctx.fillStyle = eyeData.rightEye ? '#00ff00' : '#ff0000';
        rightEyeIndices.forEach(idx => {
          const point = face.keypoints[idx];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    };

    /**
     * Update detection state with smoothing and throttling
     * Enhanced with ML data (headPose, gazeDirection, faceQuality)
     */
    const updateDetectionState = (detected, eyes, score, mlData = {}) => {
      if (!mounted) return;

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

      // STRICT: If face is not detected, immediately update state to false/0
      if (!detected) {
        lastStateRef.current = {
          faceDetected: false,
          eyeTracking: { leftEye: false, rightEye: false },
          attentionScore: 0,
        };
        setFaceDetected(false);
        setEyeTracking({ leftEye: false, rightEye: false });
        setAttentionScore(0);
        return;
      }

      // Update at most 5 times per second for smoother UI without flickering (200ms throttle)
      // But allow immediate updates when face is detected after being lost
      const lastState = lastStateRef.current;
      const faceChanged = detected !== lastState.faceDetected;
      
      if (timeSinceLastUpdate < 200 && !faceChanged) return;

      lastUpdateTimeRef.current = now;

      // Use the score directly (already smoothed by Kalman filter)
      const finalScore = score;
      
      // Only update state if values have changed significantly to prevent unnecessary re-renders
      // Use ref to compare with last state to avoid stale closure issues
      const scoreChanged = Math.abs(finalScore - lastState.attentionScore) > 1; // Only update if change > 1%
      const eyesChanged = eyes?.leftEye !== lastState.eyeTracking?.leftEye || eyes?.rightEye !== lastState.eyeTracking?.rightEye;
      
      // Update states only if there's a meaningful change
      if (faceChanged || scoreChanged || eyesChanged) {
        // Update ref first
        lastStateRef.current = {
          faceDetected: detected,
          eyeTracking: eyes,
          attentionScore: finalScore,
          ...mlData, // Store ML data for potential future use
        };
        
        // Then update React state
        if (faceChanged) setFaceDetected(detected);
        if (eyesChanged) setEyeTracking(eyes);
        if (scoreChanged) setAttentionScore(finalScore);
      }

      // Handle face lost timer
      const participant = localStorage.getItem('userName') || 'User';
      if (!detected) {
        if (!faceLostTimerRef.current) {
          faceLostTimerRef.current = setTimeout(() => {
            logMonitoringEvent({
              type: 'FaceNotDetected',
              severity: 'warning',
              details: 'Face not detected for 3 seconds',
              participant
            });
          }, 3000);
        }
      } else {
        if (faceLostTimerRef.current) {
          clearTimeout(faceLostTimerRef.current);
          faceLostTimerRef.current = null;
        }
      }
    };

    /**
     * Calculate smoothed attention score using moving average
     */
    const calculateSmoothedScore = (detected, eyes, rawScore) => {
      if (!detected) {
        // Gradually decrease score when face not detected
        attentionHistoryRef.current = [];
        return 0;
      }

      // Add current score to history
      attentionHistoryRef.current.push(rawScore);

      // Keep last 15 readings (about 0.5 seconds at 30fps)
      if (attentionHistoryRef.current.length > 15) {
        attentionHistoryRef.current.shift();
      }

      // Calculate weighted moving average (more recent = higher weight)
      let weightedSum = 0;
      let totalWeight = 0;

      attentionHistoryRef.current.forEach((score, index) => {
        const weight = index + 1; // Linear weighting
        weightedSum += score * weight;
        totalWeight += weight;
      });

      const smoothedScore = totalWeight > 0 ? weightedSum / totalWeight : rawScore;

      return Math.round(smoothedScore);
    };

    initializeFaceDetection();

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceLostTimerRef.current) {
        clearTimeout(faceLostTimerRef.current);
      }
      if (detectorRef.current?.dispose) {
        detectorRef.current.dispose();
      }
    };
  }, [videoRef]);

  return {
    faceDetected,
    eyeTracking,
    attentionScore,
    canvasRef,
    isProcessing,
    isInitialized
  };
};

export default useFaceDetection; 
