// Adaptive bitrate management for video quality based on network conditions

export class AdaptiveBitrateManager {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.currentBitrate = 1000000; // 1 Mbps default
    this.monitoring = false;
    this.stats = {
      packetsLost: 0,
      roundTripTime: 0,
      jitter: 0
    };
  }

  async startMonitoring() {
    if (this.monitoring) return;
    this.monitoring = true;
    
    const monitorLoop = async () => {
      if (!this.monitoring) return;
      
      try {
        const stats = await this.peerConnection.getStats();
        await this.analyzeStats(stats);
        await this.adjustBitrate();
      } catch (error) {
        console.error('Error monitoring connection:', error);
      }
      
      setTimeout(monitorLoop, 2000); // Check every 2 seconds
    };
    
    monitorLoop();
  }

  stopMonitoring() {
    this.monitoring = false;
  }

  async analyzeStats(stats) {
    stats.forEach(report => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        this.stats.packetsLost = report.packetsLost || 0;
        this.stats.jitter = report.jitter || 0;
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        this.stats.roundTripTime = report.currentRoundTripTime || 0;
      }
    });
  }

  async adjustBitrate() {
    const { packetsLost, roundTripTime } = this.stats;
    
    let targetBitrate = this.currentBitrate;
    
    // Adjust based on packet loss
    if (packetsLost > 50) {
      targetBitrate = Math.max(250000, this.currentBitrate * 0.7); // Reduce by 30%
    } else if (packetsLost > 20) {
      targetBitrate = Math.max(500000, this.currentBitrate * 0.85); // Reduce by 15%
    } else if (packetsLost < 5 && roundTripTime < 0.1) {
      targetBitrate = Math.min(2500000, this.currentBitrate * 1.1); // Increase by 10%
    }
    
    // Adjust based on RTT
    if (roundTripTime > 0.3) {
      targetBitrate = Math.max(250000, targetBitrate * 0.8);
    }
    
    if (targetBitrate !== this.currentBitrate) {
      await this.setBitrate(targetBitrate);
      this.currentBitrate = targetBitrate;
      console.log(`Adjusted bitrate to: ${Math.round(targetBitrate / 1000)} kbps`);
    }
  }

  async setBitrate(bitrate) {
    try {
      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
      
      if (videoSender) {
        const parameters = videoSender.getParameters();
        
        if (!parameters.encodings) {
          parameters.encodings = [{}];
        }
        
        parameters.encodings[0].maxBitrate = bitrate;
        
        await videoSender.setParameters(parameters);
      }
    } catch (error) {
      console.error('Error setting bitrate:', error);
    }
  }

  getNetworkQuality() {
    const { packetsLost, roundTripTime } = this.stats;
    
    if (packetsLost > 50 || roundTripTime > 0.3) {
      return 'poor';
    } else if (packetsLost > 20 || roundTripTime > 0.15) {
      return 'fair';
    } else if (packetsLost > 5 || roundTripTime > 0.08) {
      return 'good';
    } else {
      return 'excellent';
    }
  }
}

export async function applyVideoConstraints(stream, quality = 'high') {
  try {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack || !videoTrack.applyConstraints) return stream;
    
    const constraints = {
      high: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      medium: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      },
      low: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 }
      }
    };
    
    await videoTrack.applyConstraints(constraints[quality] || constraints.high);
    return stream;
  } catch (error) {
    console.error('Error applying video constraints:', error);
    return stream;
  }
}

