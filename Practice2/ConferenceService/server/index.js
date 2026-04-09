const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const path = require('path');
const { connect } = require('./db');
const { handleConnection } = require('./ws/handler');

const PORT = process.env.PORT || 3000;

async function main() {
  // Connect to MongoDB
  await connect();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Serve static client files
  app.use(express.static(path.join(__dirname, '..', 'client')));

  // REST Routes
  app.use('/rooms', require('./routes/rooms'));
  app.use('/rooms/:roomId', require('./routes/participants'));
  app.use('/rooms/:roomId/messages', require('./routes/messages'));

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('[API] Error:', err);
    res.status(500).json({
      error: 'InternalError',
      message: err.message || 'Something went wrong',
    });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', handleConnection);

  server.listen(PORT, () => {
    console.log(`\n🚀 Conference Service running at http://localhost:${PORT}`);
    console.log(`   REST API:   http://localhost:${PORT}/rooms`);
    console.log(`   WebSocket:  ws://localhost:${PORT}/ws`);
    console.log(`   Client UI:  http://localhost:${PORT}\n`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
