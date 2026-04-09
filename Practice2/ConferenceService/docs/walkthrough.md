# Conference Service — Walkthrough

## What Was Built

A full-stack conference service with:
- **Backend**: Node.js + Express + WebSocket (`ws`) + MongoDB
- **Frontend**: Vanilla HTML/CSS/JS with premium dark theme

## Architecture

```
server/
├── index.js              ← Entry point (Express + WS server)
├── db.js                 ← MongoDB connection
├── models/               ← Room, Participant, Message DB helpers
├── routes/               ← REST API routes
└── ws/                   ← WebSocket handler + broadcaster

client/
├── index.html            ← Lobby page
├── room.html             ← Room page
├── css/style.css         ← Premium dark theme
└── js/                   ← Lobby, Room, WebSocket, WebRTC clients
```

## Key Features Implemented

### REST API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/rooms` | Create room |
| GET | `/rooms` | List rooms |
| GET | `/rooms/:roomId` | Room info |
| POST | `/rooms/:roomId/close` | Close room |
| DELETE | `/rooms/:roomId` | Delete room (only if empty) |
| POST | `/rooms/:roomId/join` | Join room by name (reuses existing participant) |
| POST | `/rooms/:roomId/leave` | Leave room (soft-delete via `left_at`) |
| GET | `/rooms/:roomId/participants` | Active participants |
| GET | `/rooms/:roomId/messages?limit=50` | Chat history |
| POST | `/rooms/:roomId/messages` | Send message via HTTP |

### WebSocket Events
- `ws_join` → `participants_list` + `user_joined` broadcast
- `chat_message` → persist to DB → broadcast to room
- `user_left` → broadcast on disconnect
- `room_closed` → broadcast when room is closed
- `webrtc_offer/answer/ice` → signaling relay for video calls

### Participant Logic
- If a name already exists (active) in the room → reuses that participant
- Otherwise creates a new participant
- Participants are never deleted; `left_at` is set on leave

### WebSocket Reconnection
Backoff strategy: 1s → 2s → 5s with visual banner

### WebRTC Video Calls
Full signaling via WebSocket (offer/answer/ICE), using Google's public STUN servers

## Screenshots

### Lobby Page (Initial)
![Lobby page with create room form and empty room list](C:\Users\ivanz\.gemini\antigravity\brain\f5f6d403-8eb7-4d2d-991f-f09f0112b5c3\lobby_page_initial_1775667092585.png)

### Room Created
![Lobby showing "Test Room Alpha" with Active badge and Join/Close/Delete buttons](C:\Users\ivanz\.gemini\antigravity\brain\f5f6d403-8eb7-4d2d-991f-f09f0112b5c3\lobby_room_created_1775667122063.png)

### Room Page
![Room page showing participants list with UserA, chat panel, video panel, and controls](C:\Users\ivanz\.gemini\antigravity\brain\f5f6d403-8eb7-4d2d-991f-f09f0112b5c3\room_page_final_1775667164156.png)

## Browser Recording

![Full lobby and room test flow](C:\Users\ivanz\.gemini\antigravity\brain\f5f6d403-8eb7-4d2d-991f-f09f0112b5c3\lobby_test_flow_1775667078559.webp)

## How to Run

```bash
# 1. Make sure MongoDB is running on localhost:27017
# 2. Start the server
cd server
npm install
node index.js

# 3. Open http://localhost:3000
```

## Verification Results
- ✅ Lobby page loads with premium dark theme
- ✅ Room creation works (POST /rooms → 201)
- ✅ Room appears in the list with Active status
- ✅ Join modal opens, user enters name
- ✅ Join creates participant (or reuses existing)
- ✅ Room page loads with chat, participants sidebar, video panel
- ✅ WebSocket connects and shows "Connected" status
- ✅ Participant "UserA (you)" appears in sidebar
- ✅ Close Room / Leave buttons functional
- ✅ Data persisted in MongoDB
