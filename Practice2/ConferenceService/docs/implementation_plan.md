# Conference Service — Implementation Plan

A simplified conference service with rooms, participants, real-time chat, and WebRTC video calling.  
**Stack**: Node.js + Express + `ws` + MongoDB (localhost:27017) + Vanilla HTML/CSS/JS frontend.

## User Review Required

> [!IMPORTANT]
> **MongoDB**: The service assumes MongoDB is running locally at `mongodb://localhost:27017`. The database will be named `conference_service`.

> [!IMPORTANT]
> **No authentication**: For simplicity, participants are identified by `name` only (no login/password). The `participantId` returned from the join endpoint is used for all subsequent operations.

## Proposed Changes

### Project Structure

```
ConferenceService/
├── Diagram/                     # existing
├── server/
│   ├── package.json
│   ├── index.js                 # Entry point: Express + WS + MongoDB
│   ├── db.js                    # MongoDB connection helper
│   ├── models/
│   │   ├── Room.js              # Room schema & helpers
│   │   ├── Participant.js       # Participant schema & helpers
│   │   └── Message.js           # Message schema & helpers
│   ├── routes/
│   │   ├── rooms.js             # /rooms CRUD
│   │   ├── participants.js      # /rooms/:roomId/join, /leave, /participants
│   │   └── messages.js          # /rooms/:roomId/messages
│   └── ws/
│       ├── handler.js           # WebSocket connection handler
│       └── broadcaster.js       # In-memory room→clients map, broadcast helpers
├── client/
│   ├── index.html               # Lobby page (list/create rooms)
│   ├── room.html                # Room page (chat + video)
│   ├── css/
│   │   └── style.css            # Global styles (dark theme, glassmorphism)
│   └── js/
│       ├── lobby.js             # Lobby logic
│       ├── room.js              # Room logic (chat, participants list)
│       ├── ws.js                # WebSocket client with reconnect backoff
│       └── webrtc.js            # WebRTC client (optional video calls)
└── README.md
```

---

### Data Models (MongoDB Collections)

#### `rooms`
| Field        | Type     | Description                       |
|-------------|----------|-----------------------------------|
| `_id`       | ObjectId | Auto-generated                    |
| `name`      | String   | Room name (required)              |
| `closed`    | Boolean  | Default `false`                   |
| `closed_at` | Date     | Set when closed                   |
| `created_at`| Date     | Auto                              |

#### `participants`
| Field        | Type     | Description                              |
|-------------|----------|------------------------------------------|
| `_id`       | ObjectId | Auto-generated (= participantId)         |
| `room_id`   | ObjectId | FK to rooms                              |
| `name`      | String   | Display name (required)                  |
| `joined_at` | Date     | Auto                                     |
| `left_at`   | Date     | `null` = active; set on leave            |

#### `messages`
| Field           | Type     | Description                     |
|----------------|----------|---------------------------------|
| `_id`          | ObjectId | Auto-generated                  |
| `room_id`      | ObjectId | FK to rooms                     |
| `participant_id`| ObjectId | FK to participants (author)    |
| `text`         | String   | Message body (required)         |
| `created_at`   | Date     | Auto                            |

---

### REST API Endpoints

| Method | Path                             | Status | Description                          |
|--------|----------------------------------|--------|--------------------------------------|
| POST   | `/rooms`                         | 201    | Create a room `{name}`               |
| GET    | `/rooms`                         | 200    | List all rooms                       |
| GET    | `/rooms/:roomId`                 | 200    | Room details                         |
| POST   | `/rooms/:roomId/close`           | 200    | Close room (sets `closed=true`)      |
| DELETE | `/rooms/:roomId`                 | 204/409| Delete room (only if no active participants) |
| POST   | `/rooms/:roomId/join`            | 201    | Join room `{name}` → returns participant |
| POST   | `/rooms/:roomId/leave`           | 204    | Leave room `{participantId}`         |
| GET    | `/rooms/:roomId/participants`    | 200    | Active participants list             |
| GET    | `/rooms/:roomId/messages?limit=50`| 200   | Chat history (last N messages)       |
| POST   | `/rooms/:roomId/messages`        | 201    | Send message via HTTP `{participantId, text}` |

All errors returned as `{ "error": "...", "message": "..." }`.

---

### WebSocket Events

**Client → Server:**
- `ws_join`: `{ roomId, participantId }` — subscribe to room events
- `chat_message`: `{ roomId, participantId, text }` — send chat message
- `webrtc_offer`, `webrtc_answer`, `webrtc_ice` — WebRTC signaling

**Server → Client:**
- `participants_list`: `{ items: [...] }` — current active participants
- `user_joined`: `{ participant }` — new user joined
- `user_left`: `{ participantId }` — user left
- `chat_message`: `{ message }` — new chat message (broadcast)
- `room_closed`: `{ roomId }` — room was closed
- `webrtc_offer`, `webrtc_answer`, `webrtc_ice` — WebRTC signaling relay

---

### Frontend (Client)

**Lobby Page (`index.html`)**:
- Dark premium theme with glassmorphism cards
- Create new room form
- List of open rooms with join button
- Auto-refresh room list

**Room Page (`room.html`)**:
- Split layout: participants sidebar | chat area | video area
- Real-time chat with message history
- Participant list with online indicators
- WebRTC video call buttons (Start/Stop call)
- Leave room / Close room controls
- WebSocket reconnection with backoff (1s, 2s, 5s)

---

### Server Components

#### [NEW] [package.json](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/package.json)
Dependencies: `express`, `ws`, `mongodb`, `cors`

#### [NEW] [index.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/index.js)
Entry point: connects to MongoDB, sets up Express with JSON parsing, mounts routes, creates HTTP server with WebSocket upgrade, serves static client files.

#### [NEW] [db.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/db.js)
MongoDB connection singleton, exports `getDb()`.

#### [NEW] [models/Room.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/models/Room.js)
CRUD helpers for the `rooms` collection.

#### [NEW] [models/Participant.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/models/Participant.js)
CRUD helpers for the `participants` collection.

#### [NEW] [models/Message.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/models/Message.js)
CRUD helpers for the `messages` collection.

#### [NEW] [routes/rooms.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/routes/rooms.js)
Express router for room CRUD + close/delete.

#### [NEW] [routes/participants.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/routes/participants.js)
Express router for join/leave/list participants.

#### [NEW] [routes/messages.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/routes/messages.js)
Express router for chat message REST endpoints.

#### [NEW] [ws/handler.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/ws/handler.js)
WebSocket message dispatcher (ws_join, chat_message, webrtc_*).

#### [NEW] [ws/broadcaster.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/server/ws/broadcaster.js)
In-memory `Map<roomId, Set<{ws, participantId}>>` for broadcasting.

### Client Components

#### [NEW] [index.html](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/index.html)
Lobby page.

#### [NEW] [room.html](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/room.html)
Room page with chat, participants, and video.

#### [NEW] [css/style.css](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/css/style.css)
Premium dark theme with glassmorphism, animations, and responsive design.

#### [NEW] [js/lobby.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/js/lobby.js)
Lobby page logic.

#### [NEW] [js/room.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/js/room.js)
Room page logic (chat, participants).

#### [NEW] [js/ws.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/js/ws.js)
WebSocket client with automatic reconnect backoff (1s → 2s → 5s).

#### [NEW] [js/webrtc.js](file:///c:/Users/ivanz/Documents/GitHub/ConferenceService/client/js/webrtc.js)
WebRTC peer connection management and signaling.

---

## Open Questions

> [!IMPORTANT]
> 1. **Port**: Should the server run on port `3000` by default?
> 2. **WebRTC STUN/TURN**: For local testing, I'll use Google's public STUN server (`stun:stun.l.google.com:19302`). Is that acceptable, or do you have a TURN server?

## Verification Plan

### Automated Tests
1. Start MongoDB and the server
2. Use browser to test the full flow:
   - Create a room from the lobby
   - Join the room with two browser tabs
   - Send chat messages and verify real-time delivery
   - Test WebRTC video call between tabs
   - Close and delete room
3. Verify proper HTTP status codes via the browser network tab

### Manual Verification
- Visual inspection of the UI for premium design quality
- WebSocket reconnection testing (disconnect/reconnect)
- MongoDB data inspection to verify persistence
