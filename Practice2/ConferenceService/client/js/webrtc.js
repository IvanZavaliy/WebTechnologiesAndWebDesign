/* ═══════════════════════════════════
   WebRTC Video Call Client
   ═══════════════════════════════════ */

class WebRTCClient {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.iceCandidateBuffer = [];
    this.targetParticipantId = null;
    this.isActive = false;

    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  /**
   * Initialize — set up WS listeners for signaling.
   */
  init(ws, roomId, participantId) {
    this.ws = ws;
    this.roomId = roomId;
    this.participantId = participantId;

    ws.on('webrtc_offer', (payload) => this.handleOffer(payload));
    ws.on('webrtc_answer', (payload) => this.handleAnswer(payload));
    ws.on('webrtc_ice', (payload) => this.handleIceCandidate(payload));
  }

  /**
   * Start a call with a target participant.
   */
  async startCall(targetParticipantId) {
    this.targetParticipantId = targetParticipantId;
    this.isActive = true;

    try {
      // Get local media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.showLocalVideo(this.localStream);
      this.createPeerConnection();

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.ws.send('webrtc_offer', {
        to: this.targetParticipantId,
        from: this.participantId,
        roomId: this.roomId,
        sdp: offer.sdp,
        type: offer.type,
      });

      console.log('[WebRTC] Offer sent');
    } catch (err) {
      console.error('[WebRTC] Failed to start call:', err);
      this.showToast('Failed to access camera/microphone', 'error');
      this.endCall();
    }
  }

  /**
   * Handle incoming offer.
   */
  async handleOffer(payload) {
    console.log('[WebRTC] Received offer from', payload.from);
    this.targetParticipantId = payload.from;
    this.isActive = true;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.showLocalVideo(this.localStream);
      this.createPeerConnection();

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: payload.type || 'offer', sdp: payload.sdp })
      );

      // Process buffered ICE candidates
      for (const candidate of this.iceCandidateBuffer) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.iceCandidateBuffer = [];

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.ws.send('webrtc_answer', {
        to: this.targetParticipantId,
        from: this.participantId,
        roomId: this.roomId,
        sdp: answer.sdp,
        type: answer.type,
      });

      this.updateCallUI(true);
      console.log('[WebRTC] Answer sent');
    } catch (err) {
      console.error('[WebRTC] Failed to handle offer:', err);
    }
  }

  /**
   * Handle incoming answer.
   */
  async handleAnswer(payload) {
    console.log('[WebRTC] Received answer from', payload.from);
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: payload.type || 'answer', sdp: payload.sdp })
      );

      // Process buffered ICE candidates
      for (const candidate of this.iceCandidateBuffer) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      this.iceCandidateBuffer = [];

      this.updateCallUI(true);
    } catch (err) {
      console.error('[WebRTC] Failed to handle answer:', err);
    }
  }

  /**
   * Handle incoming ICE candidate.
   */
  async handleIceCandidate(payload) {
    const candidate = payload.candidate;
    if (!candidate) return;

    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[WebRTC] Failed to add ICE candidate:', err);
      }
    } else {
      // Buffer if remote description not set yet
      this.iceCandidateBuffer.push(candidate);
    }
  }

  /**
   * Create RTCPeerConnection with event handlers.
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws.send('webrtc_ice', {
          to: this.targetParticipantId,
          from: this.participantId,
          roomId: this.roomId,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');
      this.remoteStream = event.streams[0];
      this.showRemoteVideo(this.remoteStream);
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE state:', this.peerConnection.iceConnectionState);
      if (
        this.peerConnection.iceConnectionState === 'disconnected' ||
        this.peerConnection.iceConnectionState === 'failed'
      ) {
        this.endCall();
      }
    };
  }

  /**
   * End the call.
   */
  endCall() {
    this.isActive = false;

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.targetParticipantId = null;
    this.iceCandidateBuffer = [];

    // Reset UI
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    const localNoVideo = document.getElementById('localNoVideo');
    const remoteNoVideo = document.getElementById('remoteNoVideo');
    if (localNoVideo) localNoVideo.style.display = 'flex';
    if (remoteNoVideo) remoteNoVideo.style.display = 'flex';

    this.updateCallUI(false);
    console.log('[WebRTC] Call ended');
  }

  showLocalVideo(stream) {
    const video = document.getElementById('localVideo');
    const noVideo = document.getElementById('localNoVideo');
    if (video) {
      video.srcObject = stream;
      if (noVideo) noVideo.style.display = 'none';
    }
  }

  showRemoteVideo(stream) {
    const video = document.getElementById('remoteVideo');
    const noVideo = document.getElementById('remoteNoVideo');
    if (video) {
      video.srcObject = stream;
      if (noVideo) noVideo.style.display = 'none';
    }
  }

  updateCallUI(inCall) {
    const startBtn = document.getElementById('startCallBtn');
    const endBtn = document.getElementById('endCallBtn');
    if (startBtn) startBtn.style.display = inCall ? 'none' : '';
    if (endBtn) endBtn.style.display = inCall ? '' : 'none';
  }

  showToast(message, type) {
    if (window.showToast) window.showToast(message, type);
  }
}

// Global instance
window.webrtcClient = new WebRTCClient();
