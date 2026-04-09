/* ═══════════════════════════════════
   Lobby Page Logic
   ═══════════════════════════════════ */

const API = window.location.origin;
let selectedRoomId = null;

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Fetch Rooms ──
async function fetchRooms() {
  try {
    const res = await fetch(`${API}/rooms`);
    const data = await res.json();
    renderRooms(data.items || []);
  } catch (err) {
    console.error('Failed to fetch rooms:', err);
    showToast('Failed to load rooms', 'error');
  }
}

// ── Render Rooms Grid ──
function renderRooms(rooms) {
  const container = document.getElementById('roomsList');
  const countBadge = document.getElementById('roomsCount');
  const loading = document.getElementById('roomsLoading');

  if (loading) loading.style.display = 'none';

  countBadge.textContent = `${rooms.length} room${rooms.length !== 1 ? 's' : ''}`;

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏗️</div>
        <p>No rooms yet</p>
        <p style="font-size:0.85rem;">Create your first conference room above!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="rooms-grid">${rooms.map(renderRoomCard).join('')}</div>`;
}

function renderRoomCard(room) {
  const date = new Date(room.created_at).toLocaleString('uk-UA');
  const isClosed = room.closed;

  return `
    <div class="room-card ${isClosed ? 'closed' : ''}" id="room-${room._id}">
      <div class="room-name">
        ${isClosed ? '🔒' : '🟢'}
        ${escapeHtml(room.name)}
        <span class="room-status-badge ${isClosed ? 'closed' : 'open'}">
          ${isClosed ? 'Closed' : 'Active'}
        </span>
      </div>
      <div class="room-meta">Created: ${date}</div>
      <div class="room-actions">
        ${isClosed
          ? `<button class="btn btn-danger btn-sm" onclick="deleteRoom('${room._id}')">🗑️ Delete</button>`
          : `<button class="btn btn-primary btn-sm" onclick="openJoinModal('${room._id}', '${escapeHtml(room.name)}')">🚀 Join</button>
             <button class="btn btn-secondary btn-sm" onclick="closeRoomFromLobby('${room._id}')">🔒 Close</button>
             <button class="btn btn-danger btn-sm" onclick="deleteRoom('${room._id}')">🗑️ Delete</button>`
        }
      </div>
    </div>
  `;
}

// ── Create Room ──
async function createRoom() {
  const input = document.getElementById('roomNameInput');
  const name = input.value.trim();

  if (!name) {
    showToast('Please enter a room name', 'error');
    input.focus();
    return;
  }

  try {
    const res = await fetch(`${API}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.message || 'Failed to create room', 'error');
      return;
    }

    input.value = '';
    showToast(`Room "${name}" created!`, 'success');
    fetchRooms();
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ── Close Room from Lobby ──
async function closeRoomFromLobby(roomId) {
  try {
    const res = await fetch(`${API}/rooms/${roomId}/close`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.message, 'error');
      return;
    }
    showToast('Room closed', 'success');
    fetchRooms();
  } catch (err) {
    showToast('Failed to close room', 'error');
  }
}

// ── Delete Room ──
async function deleteRoom(roomId) {
  try {
    const res = await fetch(`${API}/rooms/${roomId}`, { method: 'DELETE' });
    if (res.status === 409) {
      const err = await res.json();
      showToast(err.message, 'error');
      return;
    }
    if (!res.ok && res.status !== 204) {
      showToast('Failed to delete room', 'error');
      return;
    }
    showToast('Room deleted', 'success');
    fetchRooms();
  } catch (err) {
    showToast('Failed to delete room', 'error');
  }
}

// ── Join Modal ──
function openJoinModal(roomId, roomName) {
  selectedRoomId = roomId;
  document.getElementById('joinRoomTitle').textContent = `Join "${roomName}"`;
  document.getElementById('joinNameInput').value = '';
  document.getElementById('joinModal').style.display = 'flex';
  setTimeout(() => document.getElementById('joinNameInput').focus(), 100);
}

function closeJoinModal() {
  document.getElementById('joinModal').style.display = 'none';
  selectedRoomId = null;
}

async function confirmJoin() {
  const name = document.getElementById('joinNameInput').value.trim();
  if (!name) {
    showToast('Please enter your name', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/rooms/${selectedRoomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.json();
      showToast(err.message || 'Failed to join', 'error');
      return;
    }

    const data = await res.json();
    const pid = data.participant._id;

    // Store in sessionStorage and navigate
    sessionStorage.setItem('participantId', pid);
    sessionStorage.setItem('participantName', name);
    sessionStorage.setItem('roomId', selectedRoomId);

    window.location.href = `room.html?roomId=${selectedRoomId}&participantId=${pid}&name=${encodeURIComponent(name)}`;
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ── Utilities ──
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Keyboard Shortcuts ──
document.getElementById('roomNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') createRoom();
});

document.getElementById('joinNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') confirmJoin();
});

// Close modal on overlay click
document.getElementById('joinModal').addEventListener('click', (e) => {
  if (e.target.id === 'joinModal') closeJoinModal();
});

// ── Init ──
fetchRooms();
// Auto-refresh every 10 seconds
setInterval(fetchRooms, 10000);
