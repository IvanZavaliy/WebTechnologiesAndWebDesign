/* ═══════════════════════════════════
   Room Page Logic
   ═══════════════════════════════════ */

const API = window.location.origin;

// Parse URL params
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('roomId');
const participantId = urlParams.get('participantId');
const participantName = decodeURIComponent(urlParams.get('name') || 'Anonymous');

// State
let participants = [];
let roomClosed = false;

// ── Validation ──
if (!roomId || !participantId) {
  alert('Missing roomId or participantId. Redirecting to lobby.');
  window.location.href = '/';
}

// ── Toast ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
window.showToast = showToast;

// ── Initialize ──
async function init() {
  // Load room info
  await loadRoomInfo();

  // Load chat history
  await loadChatHistory();

  // Connect WebSocket
  setupWebSocket();

  // Init WebRTC
  window.webrtcClient.init(window.conferenceWS, roomId, participantId);
}

// ── Load Room Info ──
async function loadRoomInfo() {
  try {
    const res = await fetch(`${API}/rooms/${roomId}`);
    if (!res.ok) {
      showToast('Room not found', 'error');
      setTimeout(() => (window.location.href = '/'), 2000);
      return;
    }
    const room = await res.json();
    document.getElementById('roomName').textContent = room.name;
    document.title = `${room.name} — Conference`;

    if (room.closed) {
      roomClosed = true;
      setRoomClosed();
    }
  } catch (err) {
    showToast('Failed to load room info', 'error');
  }
}

// ── Load Chat History ──
async function loadChatHistory() {
  try {
    const res = await fetch(`${API}/rooms/${roomId}/messages?limit=50`);
    const data = await res.json();
    const messages = data.items || [];
    messages.forEach((msg) => renderMessage(msg));
    scrollChatToBottom();
  } catch (err) {
    console.error('Failed to load chat history:', err);
  }
}

// ── WebSocket Setup ──
function setupWebSocket() {
  const ws = window.conferenceWS;
  ws.connect(roomId, participantId);

  ws.on('participants_list', (payload) => {
    participants = payload.items || [];
    renderParticipants();
  });

  ws.on('user_joined', (payload) => {
    if (payload.participant) {
      // Check if already in list
      const exists = participants.find(
        (p) => p._id === payload.participant._id
      );
      if (!exists) {
        participants.push(payload.participant);
      }
      renderParticipants();
      addSystemMessage(`${payload.participant.name} joined the room`);
    }
  });

  ws.on('user_left', (payload) => {
    const left = participants.find((p) => p._id === payload.participantId);
    participants = participants.filter(
      (p) => p._id !== payload.participantId
    );
    renderParticipants();
    if (left) {
      addSystemMessage(`${left.name} left the room`);
    }
  });

  ws.on('chat_message', (payload) => {
    if (payload.message) {
      renderMessage(payload.message);
      scrollChatToBottom();
    }
  });

  ws.on('room_closed', () => {
    roomClosed = true;
    setRoomClosed();
    addSystemMessage('🔒 Room has been closed by the host');
    showToast('Room has been closed', 'info');
  });

  ws.on('error', (payload) => {
    console.error('[WS Error]', payload);
    showToast(payload.message || 'WebSocket error', 'error');
  });
}

// ── Render Participants ──
function renderParticipants() {
  const list = document.getElementById('participantsList');
  const count = document.getElementById('participantCount');
  count.textContent = participants.length;

  list.innerHTML = participants
    .map((p) => {
      const initials = p.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      const isMe = p._id === participantId;
      return `
        <div class="participant-item" data-id="${p._id}" title="${escapeHtml(p.name)}">
          <div class="participant-avatar">${initials}</div>
          <span class="participant-name ${isMe ? 'is-me' : ''}">
            ${escapeHtml(p.name)}${isMe ? ' (you)' : ''}
          </span>
        </div>
      `;
    })
    .join('');
}

// ── Chat Rendering ──
function renderMessage(msg) {
  const container = document.getElementById('chatMessages');
  const time = new Date(msg.created_at).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const author = msg.from || 'Unknown';
  const initials = author
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `
    <div class="avatar">${initials}</div>
    <div class="msg-content">
      <div class="msg-author">
        ${escapeHtml(author)}
        <span class="msg-time">${time}</span>
      </div>
      <div class="msg-text">${escapeHtml(msg.text)}</div>
    </div>
  `;
  container.appendChild(div);
}

function addSystemMessage(text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg system';
  div.innerHTML = `<div class="msg-text">${escapeHtml(text)}</div>`;
  container.appendChild(div);
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const container = document.getElementById('chatMessages');
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// ── Send Message ──
function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || roomClosed) return;

  window.conferenceWS.send('chat_message', {
    roomId,
    participantId,
    text,
  });

  input.value = '';
  input.focus();
}

// ── Leave Room ──
async function leaveRoom() {
  try {
    await fetch(`${API}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId }),
    });
  } catch (err) {
    console.error('Leave error:', err);
  }

  // End any active call
  window.webrtcClient.endCall();

  // Disconnect WS
  window.conferenceWS.disconnect();

  // Navigate to lobby
  window.location.href = '/';
}

// ── Close Room ──
async function closeRoom() {
  try {
    const res = await fetch(`${API}/rooms/${roomId}/close`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.message, 'error');
    }
  } catch (err) {
    showToast('Failed to close room', 'error');
  }
}

// ── Set Room as Closed ──
function setRoomClosed() {
  const badge = document.getElementById('roomStatusBadge');
  badge.textContent = 'Closed';
  badge.className = 'room-status-badge closed';

  document.getElementById('chatInput').disabled = true;
  document.getElementById('chatInput').placeholder = 'Room is closed';
  document.getElementById('sendBtn').disabled = true;
  document.getElementById('closeRoomBtn').disabled = true;
  document.getElementById('startCallBtn').disabled = true;
}

// ── Start / End WebRTC Call ──
function startCall() {
  // Find another participant to call
  const others = participants.filter((p) => p._id !== participantId);
  if (others.length === 0) {
    showToast('No other participants to call', 'error');
    return;
  }
  // Call the first other participant
  window.webrtcClient.startCall(others[0]._id);
  window.webrtcClient.updateCallUI(true);
}

function endCall() {
  window.webrtcClient.endCall();
}

// ── Utilities ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Keyboard ──
document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Cleanup on unload ──
window.addEventListener('beforeunload', () => {
  window.conferenceWS.disconnect();
  window.webrtcClient.endCall();
});

// ── Start ──
init();
