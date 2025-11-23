/**
 * Advanced ML-based Face Detection Utilities
 * Includes head pose estimation, gaze direction, and enhanced attention scoring
 */

/**
 * Calculate head pose (yaw, pitch, roll) using facial landmarks
 * Uses 3D facial landmarks to estimate head rotation
 */
export const calculateHeadPose = (keypoints, videoWidth, videoHeight) => {
  if (!keypoints || keypoints.length < 468) {
    return { yaw: 0, pitch: 0, roll: 0, confidence: 0 };
  }

  try {
    // Key facial landmarks for head pose estimation
    const landmarks = {
      // Nose tip
      noseTip: keypoints[4],
      // Chin
      chin: keypoints[175],
      // Left eye corner
      leftEye: keypoints[33],
      // Right eye corner
      rightEye: keypoints[263],
      // Left mouth corner
      leftMouth: keypoints[61],
      // Right mouth corner
      rightMouth: keypoints[291],
      // Forehead center
      forehead: keypoints[10],
    };

    // Calculate pitch (nodding up/down)
    const noseToChin = euclideanDistance3D(landmarks.noseTip, landmarks.chin);
    const noseToForehead = euclideanDistance3D(landmarks.noseTip, landmarks.forehead);
    const verticalRatio = noseToChin / (noseToChin + noseToForehead);
    const pitch = (verticalRatio - 0.5) * 60; // Convert to degrees

    // Calculate yaw (turning left/right)
    const leftEyeToRightEye = euclideanDistance3D(landmarks.leftEye, landmarks.rightEye);
    const noseToLeftEye = euclideanDistance3D(landmarks.noseTip, landmarks.leftEye);
    const noseToRightEye = euclideanDistance3D(landmarks.noseTip, landmarks.rightEye);
    const horizontalRatio = (noseToLeftEye - noseToRightEye) / leftEyeToRightEye;
    const yaw = horizontalRatio * 45; // Convert to degrees

    // Calculate roll (tilting head left/right)
    const eyeVector = {
      x: landmarks.rightEye.x - landmarks.leftEye.x,
      y: landmarks.rightEye.y - landmarks.leftEye.y,
    };
    const roll = Math.atan2(eyeVector.y, eyeVector.x) * (180 / Math.PI);

    // Calculate confidence based on face visibility
    const faceWidth = leftEyeToRightEye;
    const faceHeight = noseToChin + noseToForehead;
    const aspectRatio = faceWidth / faceHeight;
    const confidence = Math.min(1, Math.max(0, 1 - Math.abs(aspectRatio - 0.75) / 0.75));

    return {
      yaw: Math.max(-45, Math.min(45, yaw)),
      pitch: Math.max(-30, Math.min(30, pitch)),
      roll: Math.max(-30, Math.min(30, roll)),
      confidence: confidence,
    };
  } catch (error) {
    return { yaw: 0, pitch: 0, roll: 0, confidence: 0 };
  }
};

/**
 * Calculate gaze direction using eye landmarks
 * Estimates where the person is looking
 */
export const calculateGazeDirection = (keypoints, headPose) => {
  if (!keypoints || keypoints.length < 468) {
    return { x: 0, y: 0, confidence: 0 };
  }

  try {
    // Left eye center
    const leftEyeCenter = {
      x: (keypoints[33].x + keypoints[133].x) / 2,
      y: (keypoints[33].y + keypoints[133].y) / 2,
      z: ((keypoints[33].z || 0) + (keypoints[133].z || 0)) / 2,
    };

    // Right eye center
    const rightEyeCenter = {
      x: (keypoints[362].x + keypoints[263].x) / 2,
      y: (keypoints[362].y + keypoints[263].y) / 2,
      z: ((keypoints[362].z || 0) + (keypoints[263].z || 0)) / 2,
    };

    // Iris positions (approximated)
    const leftIris = keypoints[468] || leftEyeCenter;
    const rightIris = keypoints[473] || rightEyeCenter;

    // Calculate gaze vector
    const leftGazeX = (leftIris.x - leftEyeCenter.x) / (keypoints[133].x - keypoints[33].x);
    const leftGazeY = (leftIris.y - leftEyeCenter.y) / (keypoints[145].y - keypoints[159].y);
    
    const rightGazeX = (rightIris.x - rightEyeCenter.x) / (keypoints[263].x - keypoints[362].x);
    const rightGazeY = (rightIris.y - rightEyeCenter.y) / (keypoints[374].y - keypoints[386].y);

    // Average gaze direction
    const gazeX = (leftGazeX + rightGazeX) / 2;
    const gazeY = (leftGazeY + rightGazeY) / 2;

    // Adjust for head pose
    const adjustedGazeX = gazeX - (headPose.yaw / 45);
    const adjustedGazeY = gazeY - (headPose.pitch / 30);

    // Calculate confidence based on eye visibility and head pose
    const confidence = Math.min(1, Math.max(0, 
      1 - Math.abs(headPose.yaw) / 45 - Math.abs(headPose.pitch) / 30
    ));

    return {
      x: Math.max(-1, Math.min(1, adjustedGazeX)),
      y: Math.max(-1, Math.min(1, adjustedGazeY)),
      confidence: confidence,
    };
  } catch (error) {
    return { x: 0, y: 0, confidence: 0 };
  }
};

/**
 * Validate if detected face is actually a human face
 * Checks for proper facial structure and landmarks
 */
export const validateHumanFace = (face, keypoints) => {
  // Very lenient validation - accept if we have any keypoints at all
  if (!face) {
    return { isValid: false, reason: 'no_face_object' };
  }
  
  if (!keypoints || !Array.isArray(keypoints)) {
    return { isValid: false, reason: 'no_keypoints' };
  }
  
  // Accept if we have at least 100 keypoints (very lenient)
  // This handles both refined (468) and non-refined landmark models
  if (keypoints.length < 100) {
    return { isValid: false, reason: 'insufficient_landmarks' };
  }
  
  // If we have a face box, that's a good sign
  if (!face.box) {
    return { isValid: false, reason: 'no_face_box' };
  }

  try {
    // Check for essential facial features
    const requiredLandmarks = [
      4,   // Nose tip
      33,  // Left eye corner
      263, // Right eye corner
      61,  // Left mouth corner
      291, // Right mouth corner
      175, // Chin
      10,  // Forehead
    ];

    // Check if all required landmarks are present
    for (const idx of requiredLandmarks) {
      if (!keypoints[idx] || !keypoints[idx].x || !keypoints[idx].y) {
        return { isValid: false, reason: 'missing_landmarks' };
      }
    }

    // Validate facial proportions (human faces have specific ratios)
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const noseTip = keypoints[4];
    const chin = keypoints[175];
    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];

    // Calculate face width (eye to eye distance)
    const eyeDistance = euclideanDistance3D(leftEye, rightEye);
    
    // Calculate face height (forehead to chin)
    const forehead = keypoints[10];
    const faceHeight = euclideanDistance3D(forehead, chin);
    
    // Calculate mouth width
    const mouthWidth = euclideanDistance3D(leftMouth, rightMouth);

    // Validate facial proportions (typical human face ratios)
    // Eye distance should be roughly 30-50% of face width
    // Mouth width should be roughly 40-60% of eye distance
    if (eyeDistance < 10 || faceHeight < 20) {
      return { isValid: false, reason: 'invalid_proportions' };
    }

    const eyeToFaceRatio = eyeDistance / (face.box ? (face.box.xMax - face.box.xMin) : eyeDistance * 2);
    const mouthToEyeRatio = mouthWidth / eyeDistance;

    // Check if proportions are within human face ranges (more lenient for real-world)
    if (eyeToFaceRatio < 0.15 || eyeToFaceRatio > 0.7) {
      return { isValid: false, reason: 'abnormal_eye_proportions' };
    }

    if (mouthToEyeRatio < 0.25 || mouthToEyeRatio > 0.9) {
      return { isValid: false, reason: 'abnormal_mouth_proportions' };
    }

    // Check symmetry (human faces are roughly symmetric) - more lenient
    const leftEyeToNose = euclideanDistance3D(leftEye, noseTip);
    const rightEyeToNose = euclideanDistance3D(rightEye, noseTip);
    const symmetryRatio = Math.min(leftEyeToNose, rightEyeToNose) / Math.max(leftEyeToNose, rightEyeToNose);

    if (symmetryRatio < 0.6) {
      return { isValid: false, reason: 'poor_symmetry' };
    }

    // Check if face is facing camera (not profile view) - more lenient
    const noseToChin = euclideanDistance3D(noseTip, chin);
    const noseToForehead = euclideanDistance3D(noseTip, forehead);
    const verticalRatio = noseToChin / (noseToChin + noseToForehead);

    // Vertical ratio should be around 0.4-0.6 for frontal view
    // More lenient: allow 0.25-0.75 range (was 0.35-0.65)
    if (verticalRatio < 0.25 || verticalRatio > 0.75) {
      return { isValid: false, reason: 'not_frontal_view' };
    }

    // Check if both eyes are visible - simplified check (just check if coordinates exist)
    if (!leftEye || !rightEye || leftEye.x === undefined || leftEye.y === undefined || 
        rightEye.x === undefined || rightEye.y === undefined) {
      return { isValid: false, reason: 'eyes_not_visible' };
    }

    // Check if nose is between eyes (front-facing requirement) - more lenient
    const noseX = noseTip.x;
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const noseEyeDistance = Math.abs(noseX - eyeCenterX);
    const horizontalEyeDistance = Math.abs(rightEye.x - leftEye.x); // Horizontal distance between eyes
    
    // Nose should be close to eye center (within 35% of eye distance) - more lenient (was 20%)
    if (horizontalEyeDistance > 0 && noseEyeDistance > horizontalEyeDistance * 0.35) {
      return { isValid: false, reason: 'nose_not_centered' };
    }

    return { isValid: true, reason: 'valid' };
  } catch (error) {
    return { isValid: false, reason: 'validation_error' };
  }
};

/**
 * Detect if camera is covered (shutter closed) or video is too dark
 */
export const detectCameraCovered = (video, face) => {
  if (!video || !face) {
    return { isCovered: false, confidence: 0 };
  }

  try {
    // Create canvas to analyze video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Sample pixels from the frame
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Calculate average brightness
    let totalBrightness = 0;
    let sampleCount = 0;
    const step = 100; // Sample every 100th pixel for performance

    for (let i = 0; i < pixels.length; i += step * 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      sampleCount++;
    }

    const avgBrightness = totalBrightness / sampleCount;

    // Calculate variance (uniform dark images indicate camera covered)
    let variance = 0;
    for (let i = 0; i < pixels.length; i += step * 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      variance += Math.pow(brightness - avgBrightness, 2);
    }
    variance = variance / sampleCount;
    const stdDev = Math.sqrt(variance);

    // Camera is likely covered if:
    // 1. Very dark (brightness < 25) - STRICT threshold
    // 2. Very low variance (uniform image, stdDev < 3) - STRICT threshold
    // 3. Face box is suspiciously large or covers most of screen
    const isDark = avgBrightness < 25; // More strict - very dark
    const isVeryDark = avgBrightness < 15; // Extremely dark
    const isUniform = stdDev < 3; // More strict - very uniform
    const isVeryUniform = stdDev < 2; // Extremely uniform
    
    const faceArea = face.box ? (face.box.xMax - face.box.xMin) * (face.box.yMax - face.box.yMin) : 0;
    const videoArea = canvas.width * canvas.height;
    const faceRatio = faceArea / videoArea;

    // Suspicious patterns:
    // - Very dark with large face detection (camera shutter)
    // - Very uniform with large face detection (camera covered)
    // - Extremely dark regardless of face size
    const isSuspiciousLargeFace = (isDark || isUniform) && faceRatio > 0.35;
    const isExtremelyDark = isVeryDark && avgBrightness < 10;
    const isExtremelyUniform = isVeryUniform && stdDev < 1.5;

    // Calculate confidence - more aggressive
    let confidence = 0;
    if (isExtremelyDark) confidence += 0.5;
    if (isExtremelyUniform) confidence += 0.4;
    if (isDark) confidence += 0.3;
    if (isUniform) confidence += 0.3;
    if (isSuspiciousLargeFace) confidence += 0.3;
    
    // If multiple conditions are met, increase confidence
    const conditionCount = [isDark, isUniform, isSuspiciousLargeFace, isExtremelyDark, isExtremelyUniform].filter(Boolean).length;
    if (conditionCount >= 3) {
      confidence = Math.min(1, confidence * 1.2);
    }

    return {
      isCovered: confidence > 0.5,
      confidence: Math.min(1, confidence),
      brightness: avgBrightness,
      variance: stdDev,
    };
  } catch (error) {
    return { isCovered: false, confidence: 0, error: error.message };
  }
};

/**
 * Calculate face quality score with strict validation
 * Assesses how well the face is visible and detected
 */
export const calculateFaceQuality = (face, keypoints, videoWidth, videoHeight) => {
  if (!face || !keypoints) {
    return { score: 0, factors: {}, isValid: false };
  }

  try {
    let qualityScore = 100;
    const factors = {};
    let isValid = true;

    // Face size factor (larger faces are easier to detect)
    if (face.box) {
      const faceArea = (face.box.xMax - face.box.xMin) * (face.box.yMax - face.box.yMin);
      const videoArea = videoWidth * videoHeight;
      const faceSizeRatio = faceArea / videoArea;
      
      if (faceSizeRatio < 0.05) {
        qualityScore -= 30; // Face too small - reject
        factors.size = 'too_small';
        isValid = false;
      } else if (faceSizeRatio > 0.4) {
        qualityScore -= 25; // Face too large - might be camera covered
        factors.size = 'too_large';
        isValid = false;
      } else if (faceSizeRatio < 0.08) {
        qualityScore -= 15; // Face small but acceptable
        factors.size = 'small';
      } else if (faceSizeRatio > 0.25) {
        qualityScore -= 10; // Face large but acceptable
        factors.size = 'large';
      } else {
        factors.size = 'optimal';
      }
    }

    // Face position factor (centered faces are better)
    if (face.box) {
      const centerX = (face.box.xMin + face.box.xMax) / 2;
      const centerY = (face.box.yMin + face.box.yMax) / 2;
      const videoCenterX = videoWidth / 2;
      const videoCenterY = videoHeight / 2;
      
      const offsetX = Math.abs(centerX - videoCenterX) / videoWidth;
      const offsetY = Math.abs(centerY - videoCenterY) / videoHeight;
      const offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      
      if (offset > 0.4) {
        qualityScore -= 20; // Face too far from center
        factors.position = 'very_off_center';
        isValid = false;
      } else if (offset > 0.3) {
        qualityScore -= 15; // Face far from center
        factors.position = 'off_center';
      } else {
        factors.position = 'centered';
      }
    }

    // Landmark visibility factor - STRICT
    if (keypoints.length < 468) {
      qualityScore -= 40; // Not enough landmarks - reject
      factors.landmarks = 'insufficient';
      isValid = false;
    } else {
      // Check landmark quality - all key landmarks must be present
      const keyLandmarks = [4, 33, 263, 61, 291, 175, 10, 159, 145, 386, 374];
      let missingLandmarks = 0;
      for (const idx of keyLandmarks) {
        if (!keypoints[idx] || keypoints[idx].x === undefined || keypoints[idx].y === undefined) {
          missingLandmarks++;
        }
      }
      if (missingLandmarks > 2) {
        qualityScore -= 30;
        factors.landmarks = 'poor_quality';
        isValid = false;
      } else {
        factors.landmarks = 'sufficient';
      }
    }

    // Face confidence from detection (if available)
    // MediaPipe Face Mesh might not provide probability, so we're lenient
    let faceConfidence = 1.0;
    if (face.probability !== undefined) {
      faceConfidence = face.probability;
    } else if (face.box && face.box.probability !== undefined) {
      faceConfidence = face.box.probability;
    }
    
    // Only penalize if confidence is explicitly provided and low
    // Don't reject based on missing confidence data
    if (faceConfidence !== 1.0) {
      if (faceConfidence < 0.5) {
        qualityScore -= 30; // Very low confidence - significant penalty
        factors.confidence = 'very_low';
      } else if (faceConfidence < 0.7) {
        qualityScore -= 15; // Low confidence - moderate penalty
        factors.confidence = 'low';
      } else if (faceConfidence < 0.85) {
        qualityScore -= 5; // Moderate confidence - small penalty
        factors.confidence = 'moderate';
      } else {
        factors.confidence = 'high';
      }
    } else {
      // No confidence data provided - assume good (MediaPipe default behavior)
      factors.confidence = 'unknown';
    }

    // More lenient quality threshold - accept if score > 40 (was 60)
    // This allows for real-world variations in lighting, angle, etc.
    const minQualityThreshold = 40;
    const finalValid = isValid && qualityScore > minQualityThreshold;
    
    return {
      score: Math.max(0, Math.min(100, qualityScore)),
      factors: factors,
      isValid: finalValid,
    };
  } catch (error) {
    return { score: 0, factors: { error: true }, isValid: false };
  }
};

/**
 * Enhanced attention score calculation with STRICT validation
 * Multiple ML factors with strict thresholds
 */
export const calculateEnhancedAttentionScore = (
  face,
  eyeData,
  headPose,
  gazeDirection,
  faceQuality,
  calibrationData = null,
  isValidFace = true
) => {
  // If face is not valid, return 0 immediately
  if (!isValidFace || !faceQuality.isValid) {
    return 0;
  }

  // More lenient minimum quality threshold (40 instead of 60)
  if (faceQuality.score < 40) {
    return 0;
  }

  // Head pose validation - reject if too extreme (slightly more lenient)
  if (Math.abs(headPose.yaw) > 30 || Math.abs(headPose.pitch) > 25 || Math.abs(headPose.roll) > 25) {
    return 0;
  }

  // Head pose confidence - more lenient (0.5 instead of 0.6)
  if (headPose.confidence < 0.5) {
    return 0;
  }

  let score = 0;
  const weights = {
    faceDetection: 0.15,
    eyeOpenness: 0.25,
    headPose: 0.25, // Increased weight
    gazeDirection: 0.20,
    faceQuality: 0.10,
    eyeSymmetry: 0.05, // Reduced weight
  };

  // 1. Face Detection Score (15%) - More lenient
  if (face && faceQuality.isValid && faceQuality.score > 40) {
    score += weights.faceDetection * 100;
  } else {
    return 0; // Reject if face quality is poor
  }

  // 2. Eye Openness Score (25%) - STRICT
  const eyeOpennessScore = calculateEyeOpennessScore(eyeData, calibrationData);
  // Both eyes must be detectable for good score
  if (eyeData.leftEAR === 0 && eyeData.rightEAR === 0) {
    return 0; // Reject if eyes not detectable
  }
  score += weights.eyeOpenness * eyeOpennessScore;

  // 3. Head Pose Score (25%) - STRICT (increased weight)
  const headPoseScore = calculateHeadPoseScore(headPose);
  if (headPoseScore === 0) {
    return 0; // Reject if head pose is invalid
  }
  score += weights.headPose * headPoseScore;

  // 4. Gaze Direction Score (20%) - STRICT
  const gazeScore = calculateGazeDirectionScore(gazeDirection);
  // If gaze is too far from center, heavily penalize
  if (Math.abs(gazeDirection.x) > 0.6 || Math.abs(gazeDirection.y) > 0.6) {
    score += weights.gazeDirection * gazeScore * 0.5; // Heavy penalty
  } else {
    score += weights.gazeDirection * gazeScore;
  }

  // 5. Face Quality Score (10%)
  score += weights.faceQuality * faceQuality.score;

  // 6. Eye Symmetry Score (5%) - Reduced weight
  const eyeSymmetryScore = calculateEyeSymmetryScore(eyeData);
  score += weights.eyeSymmetry * eyeSymmetryScore;

  // Final validation: Score must meet minimum threshold
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Reject scores below 30 (very poor attention) - more lenient
  if (finalScore < 30) {
    return 0;
  }

  return finalScore;
};

/**
 * Calculate eye openness score with adaptive thresholds
 */
const calculateEyeOpennessScore = (eyeData, calibrationData) => {
  if (!eyeData) return 0;

  let score = 0;

  // Use calibrated thresholds if available
  const leftThreshold = calibrationData?.leftEARThreshold || 0.15;
  const rightThreshold = calibrationData?.rightEARThreshold || 0.15;

  // Left eye score
  if (eyeData.leftEye && eyeData.leftEAR > leftThreshold) {
    const leftScore = Math.min(100, (eyeData.leftEAR / 0.3) * 100);
    score += leftScore / 2;
  }

  // Right eye score
  if (eyeData.rightEye && eyeData.rightEAR > rightThreshold) {
    const rightScore = Math.min(100, (eyeData.rightEAR / 0.3) * 100);
    score += rightScore / 2;
  }

  return score;
};

/**
 * Calculate head pose score with STRICT validation
 * Heavily penalizes looking away from camera
 */
const calculateHeadPoseScore = (headPose) => {
  if (!headPose) return 0;

  let score = 100;

    // Yaw penalty (turning left/right) - more lenient (30° instead of 25°)
    // If yaw > 30°, reject completely
    if (Math.abs(headPose.yaw) > 30) {
      return 0; // Reject if turned too far
    }
    const yawPenalty = Math.abs(headPose.yaw) / 30 * 50; // Adjusted penalty
    score -= yawPenalty;

    // Pitch penalty (looking up/down) - more lenient (25° instead of 20°)
    // If pitch > 25°, reject completely
    if (Math.abs(headPose.pitch) > 25) {
      return 0; // Reject if looking too far up/down
    }
    const pitchPenalty = Math.abs(headPose.pitch) / 25 * 40;
    score -= pitchPenalty;

    // Roll penalty (tilting head) - more lenient (25° instead of 20°)
    // If roll > 25°, reject completely
    if (Math.abs(headPose.roll) > 25) {
      return 0; // Reject if tilted too much
    }
    const rollPenalty = Math.abs(headPose.roll) / 25 * 25;
    score -= rollPenalty;

    // Apply confidence - more lenient (0.5 instead of 0.6)
    const confidenceMultiplier = headPose.confidence || 0.5;
    if (confidenceMultiplier < 0.5) {
      return 0; // Reject if confidence too low
    }
    score *= Math.max(0.5, confidenceMultiplier); // Minimum 0.5 multiplier

  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate gaze direction score
 * Penalizes looking away from screen
 */
const calculateGazeDirectionScore = (gazeDirection) => {
  if (!gazeDirection) return 50;

  let score = 100;

  // Gaze X penalty (looking left/right)
  const gazeXPenalty = Math.abs(gazeDirection.x) * 30;
  score -= gazeXPenalty;

  // Gaze Y penalty (looking up/down)
  const gazeYPenalty = Math.abs(gazeDirection.y) * 25;
  score -= gazeYPenalty;

  // Apply confidence
  score *= gazeDirection.confidence || 0.5;

  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate eye symmetry score
 * Measures how similar both eyes are (indicator of attention)
 */
const calculateEyeSymmetryScore = (eyeData) => {
  if (!eyeData || !eyeData.leftEAR || !eyeData.rightEAR) return 50;

  const leftEAR = eyeData.leftEAR || 0;
  const rightEAR = eyeData.rightEAR || 0;

  // Calculate symmetry (how similar both eyes are)
  const earDifference = Math.abs(leftEAR - rightEAR);
  const avgEAR = (leftEAR + rightEAR) / 2;
  const symmetry = avgEAR > 0 ? 1 - (earDifference / avgEAR) : 0;

  return Math.max(0, Math.min(100, symmetry * 100));
};

/**
 * Kalman Filter for smooth attention score predictions
 */
export class KalmanFilter {
  constructor(processNoise = 0.01, measurementNoise = 0.25) {
    this.processNoise = processNoise;
    this.measurementNoise = measurementNoise;
    this.estimate = 50; // Initial estimate
    this.errorEstimate = 1; // Initial error estimate
  }

  update(measurement) {
    // Prediction step
    const errorPredict = this.errorEstimate + this.processNoise;

    // Update step
    const kalmanGain = errorPredict / (errorPredict + this.measurementNoise);
    this.estimate = this.estimate + kalmanGain * (measurement - this.estimate);
    this.errorEstimate = (1 - kalmanGain) * errorPredict;

    return this.estimate;
  }

  reset() {
    this.estimate = 50;
    this.errorEstimate = 1;
  }
}

/**
 * Adaptive EAR threshold calibration
 * Learns user's baseline EAR values for better accuracy
 */
export class AdaptiveEARCalibration {
  constructor() {
    this.leftEARHistory = [];
    this.rightEARHistory = [];
    this.calibrationFrames = 60; // Calibrate over 1 second at 60fps
    this.isCalibrated = false;
  }

  addSample(leftEAR, rightEAR) {
    if (this.isCalibrated) return;

    this.leftEARHistory.push(leftEAR);
    this.rightEARHistory.push(rightEAR);

    if (this.leftEARHistory.length > this.calibrationFrames) {
      this.leftEARHistory.shift();
      this.rightEARHistory.shift();
    }

    if (this.leftEARHistory.length >= this.calibrationFrames) {
      this.calibrate();
    }
  }

  calibrate() {
    // Calculate baseline EAR values
    const leftBaseline = this.leftEARHistory.reduce((a, b) => a + b, 0) / this.leftEARHistory.length;
    const rightBaseline = this.rightEARHistory.reduce((a, b) => a + b, 0) / this.rightEARHistory.length;

    // Calculate standard deviations
    const leftStdDev = Math.sqrt(
      this.leftEARHistory.reduce((sum, val) => sum + Math.pow(val - leftBaseline, 2), 0) /
      this.leftEARHistory.length
    );
    const rightStdDev = Math.sqrt(
      this.rightEARHistory.reduce((sum, val) => sum + Math.pow(val - rightBaseline, 2), 0) /
      this.rightEARHistory.length
    );

    // Set adaptive thresholds (baseline - 2*stdDev for blink detection)
    this.leftEARThreshold = Math.max(0.1, leftBaseline - 2 * leftStdDev);
    this.rightEARThreshold = Math.max(0.1, rightBaseline - 2 * rightStdDev);

    this.isCalibrated = true;
    console.log('✅ EAR Calibration complete:', {
      leftThreshold: this.leftEARThreshold,
      rightThreshold: this.rightEARThreshold,
      leftBaseline,
      rightBaseline,
    });
  }

  getThresholds() {
    if (!this.isCalibrated) {
      return { leftEARThreshold: 0.15, rightEARThreshold: 0.15 };
    }
    return {
      leftEARThreshold: this.leftEARThreshold,
      rightEARThreshold: this.rightEARThreshold,
    };
  }

  reset() {
    this.leftEARHistory = [];
    this.rightEARHistory = [];
    this.isCalibrated = false;
  }
}

/**
 * Helper function: Calculate 3D Euclidean distance
 */
const euclideanDistance3D = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = (point1.z || 0) - (point2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Helper function: Calculate Euclidean distance (2D)
 */
const euclideanDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = (point1.z || 0) - (point2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export { euclideanDistance, euclideanDistance3D };

