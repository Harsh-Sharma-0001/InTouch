// Audio enhancement utilities for noise suppression and quality improvement

export async function applyNoiseSuppressionToStream(stream) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    
    // Create noise suppression using Web Audio API
    const gainNode = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();
    
    // Configure compressor for voice optimization
    compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
    compressor.knee.setValueAtTime(40, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);
    
    // Connect nodes
    source.connect(compressor);
    compressor.connect(gainNode);
    
    // Create destination for enhanced audio
    const destination = audioContext.createMediaStreamDestination();
    gainNode.connect(destination);
    
    // Get enhanced audio track
    const enhancedAudioTrack = destination.stream.getAudioTracks()[0];
    
    // Apply additional constraints for noise suppression
    if (enhancedAudioTrack.applyConstraints) {
      await enhancedAudioTrack.applyConstraints({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      });
    }
    
    // Replace original audio track with enhanced one
    const videoTracks = stream.getVideoTracks();
    const enhancedStream = new MediaStream([...videoTracks, enhancedAudioTrack]);
    
    return enhancedStream;
  } catch (error) {
    console.error('Error applying noise suppression:', error);
    return stream; // Return original stream if enhancement fails
  }
}

export async function applyAudioConstraints(stream) {
  try {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack && audioTrack.applyConstraints) {
      await audioTrack.applyConstraints({
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        sampleRate: { ideal: 48000 },
        channelCount: { ideal: 1 }
      });
    }
    return stream;
  } catch (error) {
    console.error('Error applying audio constraints:', error);
    return stream;
  }
}

