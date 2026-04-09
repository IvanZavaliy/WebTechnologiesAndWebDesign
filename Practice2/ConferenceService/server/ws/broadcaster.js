/**
 * In-memory room → WebSocket clients map.
 * Map<roomId(string), Set<{ws, participantId}>>
 */
const rooms = new Map();

function addClient(roomId, participantId, ws) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add({ ws, participantId });
  console.log(`[WS] Client ${participantId} joined room ${roomId} (${rooms.get(roomId).size} clients)`);
}

function removeClient(roomId, participantId) {
  const clients = rooms.get(roomId);
  if (!clients) return;
  for (const client of clients) {
    if (client.participantId === participantId) {
      clients.delete(client);
      break;
    }
  }
  if (clients.size === 0) {
    rooms.delete(roomId);
  }
  console.log(`[WS] Client ${participantId} removed from room ${roomId}`);
}

function removeByWs(ws) {
  for (const [roomId, clients] of rooms) {
    for (const client of clients) {
      if (client.ws === ws) {
        clients.delete(client);
        console.log(`[WS] Client ${client.participantId} disconnected from room ${roomId}`);
        if (clients.size === 0) {
          rooms.delete(roomId);
        }
        return { roomId, participantId: client.participantId };
      }
    }
  }
  return null;
}

function broadcastToRoom(roomId, message, excludeParticipantId = null) {
  const clients = rooms.get(roomId);
  if (!clients) return;

  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.participantId === excludeParticipantId) continue;
    if (client.ws.readyState === 1) {
      // WebSocket.OPEN = 1
      client.ws.send(data);
    }
  }
  console.log(`[WS] Broadcast ${message.type} to room ${roomId} (${clients.size} clients)`);
}

function sendToParticipant(roomId, participantId, message) {
  const clients = rooms.get(roomId);
  if (!clients) return;

  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.participantId === participantId && client.ws.readyState === 1) {
      client.ws.send(data);
      break;
    }
  }
}

function getClientsInRoom(roomId) {
  const clients = rooms.get(roomId);
  return clients ? clients.size : 0;
}

module.exports = {
  addClient,
  removeClient,
  removeByWs,
  broadcastToRoom,
  sendToParticipant,
  getClientsInRoom,
};
