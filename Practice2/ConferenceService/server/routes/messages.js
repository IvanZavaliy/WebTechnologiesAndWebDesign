const { Router } = require('express');
const Message = require('../models/Message');
const Participant = require('../models/Participant');
const Room = require('../models/Room');
const { ObjectId } = require('mongodb');
const { broadcastToRoom } = require('../ws/broadcaster');

const router = Router({ mergeParams: true });

// GET /rooms/:roomId/messages?limit=50 — chat history
router.get('/', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const messages = await Message.findByRoom(roomId, limit);

    // Enrich messages with participant names
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const participant = await Participant.findById(msg.participant_id);
        return {
          ...msg,
          from: participant ? participant.name : 'Unknown',
        };
      })
    );

    res.json({ items: enriched });
  } catch (err) {
    next(err);
  }
});

// POST /rooms/:roomId/messages — send message via HTTP
router.post('/', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { participantId, text } = req.body;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'text is required',
      });
    }
    if (!participantId || !ObjectId.isValid(participantId)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'participantId is required',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }
    if (room.closed) {
      return res.status(409).json({ error: 'Conflict', message: 'Room is closed' });
    }

    const participant = await Participant.findById(participantId);
    if (!participant || participant.left_at) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Active participant not found',
      });
    }

    const message = await Message.create(roomId, participantId, text.trim());

    const payload = {
      ...message,
      from: participant.name,
    };

    // Broadcast to all WS clients in the room
    broadcastToRoom(roomId, {
      type: 'chat_message',
      payload: { message: payload },
    });

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
