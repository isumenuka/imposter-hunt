# Imposter Game - Backend Server

WebSocket-based multiplayer server for the Imposter Guess Word game using Socket.IO.

## Features

- ✅ **Socket.IO WebSocket connections** - Reliable real-time communication
- ✅ **Authoritative server** - All game logic validated server-side
- ✅ **Room management** - Create, join, leave rooms
- ✅ **Player reconnection** - Automatic reconnection handling
- ✅ **Anti-cheat** - Server-side validation prevents manipulation
- ✅ **Auto-cleanup** - Old rooms cleaned up automatically
- ✅ **AI word generation** - OpenAI integration with fallback words

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_actual_openai_api_key
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## Deployment to Render

### Option 1: Web Dashboard

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `imposter-game-server` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   - `OPENAI_API_KEY` = your OpenAI API key
   - `FRONTEND_URL` = your Vercel URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV` = `production`

6. Click **Create Web Service**

### Option 2: render.yaml (Infrastructure as Code)

Create `render.yaml` in your repo root:

```yaml
services:
  - type: web
    name: imposter-game-server
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        sync: false
      - key: OPENAI_API_KEY
        sync: false
```

Then deploy via Render dashboard using "Blueprint" option.

## API Endpoints

- `GET /` - Server info
- `GET /health` - Health check (used by Render)
- `GET /stats` - Room and player statistics

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ player }` | Create new room |
| `join_room` | `{ roomCode, player }` | Join existing room |
| `leave_room` | - | Leave current room |
| `go_to_settings` | - | Move to settings phase |
| `update_settings` | `{ settings }` | Update game config (host only) |
| `update_player_categories` | `{ categories }` | Update player's categories |
| `start_game` | - | Start the game (host only) |
| `player_ready` | - | Mark player as ready |
| `start_voting` | - | Start voting phase |
| `cast_vote` | `{ suspectId }` | Cast a vote |
| `reset_game` | - | Reset to lobby |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room_state` | `RoomState` | Full game state update |
| `error` | `{ message }` | Error occurred |
| `player_disconnected` | `{ playerId, playerName }` | Player left |
| `player_reconnected` | `{ playerId }` | Player returned |

## Project Structure

```
backend/
├── server.js           # Main Express + Socket.IO server
├── gameManager.js      # Room and player management
├── gameLogic.js        # Game rules and validation
├── aiService.js        # OpenAI integration + fallbacks
├── package.json        # Dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## Free Tier Limitations

Render free tier includes:
- ✅ 512MB RAM
- ✅ Persistent WebSocket connections
- ✅ 750 hours/month compute time
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 30-60 second cold start

The server handles cold starts gracefully with automatic reconnection logic.

## Testing

### Local Testing

1. Start server: `npm run dev`
2. Start frontend: `cd .. && npm run dev`
3. Open multiple browser tabs to test multiplayer

### Production Testing

1. Deploy to Render
2. Update frontend `VITE_SERVER_URL` to Render URL
3. Test with multiple devices/networks

## Monitoring

Check server logs in Render dashboard:
- Room creation/deletion
- Player connections/disconnections  
- Game phase transitions
- Errors and warnings

## Troubleshooting

**Server won't start:**
- Check `OPENAI_API_KEY` is set (or server will use fallback words)
- Verify Node version >= 18
- Check port 3001 is available

**CORS errors:**
- Update `FRONTEND_URL` in `.env` to match your frontend URL exactly
- Include `https://` prefix

**Players can't connect:**
- Verify Render deployment is successful
- Check frontend has correct server URL
- Test health endpoint: `https://your-app.onrender.com/health`

**Cold start delays:**
- First connection after 15min idle takes 30-60s (free tier limitation)
- Subsequent connections are instant
- Consider periodic ping to keep server warm (not recommended for free tier)
