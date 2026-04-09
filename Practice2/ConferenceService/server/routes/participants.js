const { Router } = require('express');
const Room = require('../models/Room');
const Participant = require('../models/Participant');
const { ObjectId } = require('mongodb');
const { broadcastToRoom, removeClient } = require('../ws/broadcaster');

const router = Router({ mergeParams: true });

// POST /rooms/:roomId/join — join room
router.post('/join', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'name is required',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }
    if (room.closed) {
      return res.status(409).json({ error: 'Conflict', message: 'Room is closed' });
    }

    const { participant, isNew } = await Participant.joinOrCreate(roomId, name.trim());

    res.status(201).json({ participant, room, isNew });
  } catch (err) {
    next(err);
  }
});

// POST /rooms/:roomId/leave — leave room
router.post('/leave', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { participantId } = req.body;

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    if (!participantId || !ObjectId.isValid(participantId)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'participantId is required',
      });
    }

    const left = await Participant.leave(participantId);
    if (!left) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Active participant not found',
      });
    }

    // Remove WS client and broadcast
    removeClient(roomId, participantId);
    broadcastToRoom(roomId, {
      type: 'user_left',
      payload: { participantId },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /rooms/:roomId/participants — list active participants
router.get('/participants', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }

    const participants = await Participant.findActive(roomId);
    res.json({ items: participants });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
