const Participant = require('../models/Participant');
const Message = require('../models/Message');
const {
  addClient,
  removeByWs,
  broadcastToRoom,
  sendToParticipant,
} = require('./broadcaster');

function handleConnection(ws) {
  console.log('[WS] New connection');

  ws.on('message', async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid JSON' } }));
      return;
    }

    const { type, payload } = data;
    console.log(`[WS] Received: ${type}`, payload?.roomId || '');

    try {
      switch (type) {
        case 'ws_join':
          await handleJoin(ws, payload);
          break;

        case 'chat_message':
          await handleChatMessage(ws, payload);
          break;

        case 'webrtc_offer':
        case 'webrtc_answer':
        case 'webrtc_ice':
          handleWebRTC(ws, type, payload);
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', payload: { message: `Unknown type: ${type}` } }));
      }
    } catch (err) {
      console.error(`[WS] Error handling ${type}:`, err.message);
      ws.send(JSON.stringify({ type: 'error', payload: { message: err.message } }));
    }
  });

  ws.on('close', () => {
    const info = removeByWs(ws);
    if (info) {
      broadcastToRoom(info.roomId, {
        type: 'user_left',
        payload: { participantId: info.participantId },
      });
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });
}

async function handleJoin(ws, payload) {
  const { roomId, participantId } = payload;
  if (!roomId || !participantId) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'roomId and participantId required' } }));
    return;
  }

  addClient(roomId, participantId, ws);

  // Send current participants list to this client
  const participants = await Participant.findActive(roomId);
  ws.send(JSON.stringify({
    type: 'participants_list',
    payload: { items: participants },
  }));

  // Broadcast user_joined to others
  const participant = await Participant.findById(participantId);
  if (participant) {
    broadcastToRoom(roomId, {
      type: 'user_joined',
      payload: { participant },
    }, participantId);
  }
}

async function handleChatMessage(ws, payload) {
  const { roomId, participantId, text } = payload;
  if (!roomId || !participantId || !text || !text.trim()) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'roomId, participantId, and text required' } }));
    return;
  }

  // Validate participant is active
  const participant = await Participant.findById(participantId);
  if (!participant || participant.left_at) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'Participant not active' } }));
    return;
  }

  // Persist first, then broadcast
  const message = await Message.create(roomId, participantId, text.trim());

  const enriched = {
    ...message,
    from: participant.name,
  };

  // Broadcast to ALL clients in the room (including sender)
  broadcastToRoom(roomId, {
    type: 'chat_message',
    payload: { message: enriched },
  });
}

function handleWebRTC(ws, type, payload) {
  const { to, from, roomId } = payload;
  if (!to || !from) {
    ws.send(JSON.stringify({ type: 'error', payload: { message: 'to and from required for WebRTC signaling' } }));
    return;
  }

  // Relay the signaling message to the target participant
  const targetRoomId = roomId || '';
  if (targetRoomId) {
    sendToParticipant(targetRoomId, to, {
      type,
      payload: { ...payload, from },
    });
  }
}

module.exports = { handleConnection };
