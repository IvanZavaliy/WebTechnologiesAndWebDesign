const { Router } = require('express');
const Room = require('../models/Room');
const Participant = require('../models/Participant');
const { ObjectId } = require('mongodb');

const router = Router();

// POST /rooms — create room
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'name is required',
      });
    }

    const room = await Room.create(name.trim());
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
});

// GET /rooms — list all rooms
router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.findAll();
    res.json({ items: rooms });
  } catch (err) {
    next(err);
  }
});

// GET /rooms/:roomId — room info
router.get('/:roomId', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    next(err);
  }
});

// POST /rooms/:roomId/close — close room
router.post('/:roomId/close', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }
    if (room.closed) {
      return res.status(409).json({ error: 'Conflict', message: 'Room is already closed' });
    }

    await Room.closeRoom(req.params.roomId);

    // Mark all participants as left
    await Participant.leaveAllInRoom(req.params.roomId);

    // Notify WS clients
    const { broadcastToRoom } = require('../ws/broadcaster');
    broadcastToRoom(req.params.roomId, {
      type: 'room_closed',
      payload: { roomId: req.params.roomId },
    });

    const updated = await Room.findById(req.params.roomId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /rooms/:roomId — delete room (only if no active participants)
router.delete('/:roomId', async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.roomId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid roomId' });
    }
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'NotFound', message: 'Room not found' });
    }

    const activeCount = await Participant.countActive(req.params.roomId);
    if (activeCount > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Cannot delete room with ${activeCount} active participant(s)`,
      });
    }

    await Room.deleteRoom(req.params.roomId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
