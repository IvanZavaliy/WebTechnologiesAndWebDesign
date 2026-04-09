/* ═══════════════════════════════════
   WebSocket Client with Reconnect
   ═══════════════════════════════════ */

class ConferenceWS {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.backoffDelays = [1000, 2000, 5000]; // 1s, 2s, 5s
    this.shouldReconnect = true;
    this.roomId = null;
    this.participantId = null;
  }

  /**
   * Connect to WebSocket and join a room.
   */
  connect(roomId, participantId) {
    this.roomId = roomId;
    this.participantId = participantId;
    this.shouldReconnect = true;
    this._doConnect();
  }

  _doConnect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws`;

    console.log(`[WS] Connecting to ${url}...`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
      this._updateStatus(true);

      // Send ws_join
      this.send('ws_join', {
        roomId: this.roomId,
        participantId: this.participantId,
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[WS] Received: ${data.type}`);
        this._emit(data.type, data.payload);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Connection closed');
      this._updateStatus(false);
      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }

  _scheduleReconnect() {
    const delay = this.backoffDelays[
      Math.min(this.reconnectAttempts, this.backoffDelays.length - 1)
    ];
    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    const banner = document.getElementById('reconnectBanner');
    if (banner) {
      banner.textContent = `⚠️ Connection lost. Reconnecting in ${delay / 1000}s... (attempt ${this.reconnectAttempts})`;
      banner.classList.add('visible');
    }

    setTimeout(() => {
      if (this.shouldReconnect) {
        this._doConnect();
      }
    }, delay);
  }

  _updateStatus(connected) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const banner = document.getElementById('reconnectBanner');

    if (dot) {
      dot.className = connected ? 'status-dot' : 'status-dot offline';
    }
    if (text) {
      text.textContent = connected ? 'Connected' : 'Disconnected';
    }
    if (banner && connected) {
      banner.classList.remove('visible');
    }
  }

  /**
   * Send a typed message.
   */
  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  /**
   * Register an event listener.
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  /**
   * Remove all listeners for a type.
   */
  off(type) {
    this.listeners.delete(type);
  }

  _emit(type, payload) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }

  /**
   * Disconnect and stop reconnection.
   */
  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Global instance
window.conferenceWS = new ConferenceWS();
