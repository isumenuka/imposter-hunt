# Complete WebSocket Multiplayer System - Deployment & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Render account (free)
- Vercel account (free, if deploying frontend)
- OpenAI API key (optional - fallback words work without it)

---

## 📦 Backend Deployment (Render)

### Step 1: Prepare Repository

Ensure your backend folder is committed to GitHub/GitLab:

```bash
git add backend/
git commit -m "Add WebSocket multiplayer backend"
git push
```

### Step 2: Deploy to Render

#### Option A: Web Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up or log in
   - Click **New +** → **Web Service**

2. **Connect Repository**
   - Choose your Git provider
   - Select your repository
   - Click **Connect**

3. **Configure Service**
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `imposter-game-server` |
   | **Region** | Choose closest to users (e.g., Oregon) |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Instance Type** | **Free** |

4. **Set Environment Variables**
   
   Click **Advanced** → **Add Environment Variable**:
   
   | Key | Value |
   |-----|-------|
   | `OPENAI_API_KEY` | Your OpenAI API key (or skip for fallback) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` |
   | `NODE_ENV` | `production` |

5. **Create Web Service**
   - Click **Create Web Service**
   - Wait 2-3 minutes for deployment
   - Copy your service URL (e.g., `https://imposter-game-xyz.onrender.com`)

#### Option B: render.yaml Blueprint

Create `render.yaml` in project root:

\`\`\`yaml
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
\`\`\`

Then deploy via Render dashboard using **Blueprint**.

### Step 3: Verify Backend

Visit the health endpoint:
```
https://your-render-app.onrender.com/health
```

You should see:
\`\`\`json
{
  "status": "ok",
  "uptime": 42.5,
  "totalRooms": 0,
  "totalPlayers": 0
}
\`\`\`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

Create `.env` in project root:

```bash
VITE_SERVER_URL=https://your-render-app.onrender.com
```

**Replace with your actual Render URL!**

### Step 3: Test Locally

```bash
# Start backend (in separate terminal)
cd backend
npm run dev

# Start frontend
npm run dev
```

Open `http://localhost:5173` and test multiplayer.

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**OR** use Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   - `VITE_SERVER_URL` = `https://your-render-app.onrender.com`
4. Deploy

---

## 🧪 Testing Multiplayer

### Test 1: Local Same Network

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Open http://localhost:5173 in **two browser tabs**
4. **Tab 1**: Create game → Copy room code
5. **Tab 2**: Join game → Enter room code
6. ✅ Verify both players see each other

### Test 2: Local Different Devices

1. Start backend locally
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update frontend `.env`: `VITE_SERVER_URL=http://YOUR_LOCAL_IP:3001`
4. Open on phone and laptop on same WiFi
5. ✅ Verify they can play together

### Test 3: Production Cross-Network

**MOST IMPORTANT TEST**

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. **Test with 3+ devices:**
   - Desktop browser (WiFi)
   - Mobile phone (4G/5G data, NOT WiFi)
   - Friend's device in different location
   - Tablet on different WiFi network

4. **Test Scenarios:**
   - ✅ Create room and share code
   - ✅ Join with room code
   - ✅ All players see synchronized state
   - ✅ Start game → roles assigned
   - ✅ Vote → results calculated correctly
   - ✅ Disconnect and reconnect (should restore state)
   - ✅ Close app and reopen (should remember room)

### Test 4: International Players

**Option A: VPN Testing**
1. Use VPN to connect from different countries
2. Create room from one location
3. Join from another location
4. ✅ Verify latency is acceptable (<500ms)

**Option B: Real Users**
1. Share deployed URL with friends abroad
2. Ask them to test
3. Monitor Render logs for errors

**Option C: ngrok for Local Testing**
```bash
# Install ngrok
# Run backend locally
cd backend && npm run dev

# In new terminal
ngrok http 3001
```
Use ngrok URL as `VITE_SERVER_URL`

---

## 🔍 Monitoring & Debugging

### Check Backend Logs

**Render Dashboard:**
1. Go to your service
2. Click **Logs** tab
3. Watch real-time logs:
   - `✅ Room ABCD created`
   - `✅ Player John joined room ABCD`
   - `🔌 Client connected`
   - `❌ Errors` (if any)

### Check Frontend Console

Open browser DevTools (F12) → Console:
- `✅ Connected to server`
- `📥 Room state update: LOBBY`
- `❌ Connection error` (troubleshoot)

### Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to connect" | Check `VITE_SERVER_URL` matches Render URL exactly |
| CORS errors | Verify `FRONTEND_URL` in Render matches Vercel URL |
| "Room not found" | Room may have expired (30min inactivity) |
| Slow connection | Render free tier cold start (~30-60s first time) |
| Disconnects frequently | Check internet stability, reconnection should auto-handle |

---

## 📊 Performance Monitoring

### Render Free Tier Limits

- ✅ 512MB RAM - sufficient for ~20 concurrent rooms
- ✅ 750 hours/month compute (~25 hours/day)
- ⚠️ Spins down after 15min idle
- ⚠️ Cold start: 30-60s

### Optimization Tips

1. **Keep server warm** (not recommended for free tier):
   ```javascript
   // Ping every 14 minutes
   setInterval(() => {
     fetch('https://your-render-app.onrender.com/health');
   }, 14 * 60 * 1000);
   ```

2. **Monitor stats**:
   ```
   https://your-render-app.onrender.com/stats
   ```

3. **Room cleanup**:
   - Automatic cleanup after 30min inactivity
   - Max 2 hour room lifetime

---

## 🌍 Multi-Region Strategy

For global players, consider:

1. **Single Region** (Free Tier):
   - Deploy to Oregon (central US)
   - Acceptable latency worldwide (<300ms)
   - Good for turn-based games

2. **Multi-Region** (Paid):
   - Deploy to multiple Render regions
   - Use geo-routing
   - Not needed for this game

---

## ✅ Deployment Checklist

### Backend
- [x] Code committed to Git
- [ ] Deployed to Render
- [ ] Environment variables set
- [ ] Health endpoint returns 200
- [ ] Logs show no errors

### Frontend
- [ ] `VITE_SERVER_URL` points to Render URL
- [ ] Socket.IO client dependency installed
- [ ] Deployed to Vercel
- [ ] Can access deployed URL

### Testing
- [ ] Tested locally (2 tabs)
- [ ] Tested on mobile device
- [ ] Tested cross-network (4G + WiFi)
- [ ] Tested with 4+ players
- [ ] Tested reconnection
- [ ] Tested game flow end-to-end

### Security
- [ ] OpenAI API key not exposed in frontend
- [ ] CORS configured correctly
- [ ] No sensitive data in Git

---

## 🎮 Final Test Script

Run through this complete game flow:

1. **Player 1** (Desktop WiFi):
   - Open app
   - Create game
   - Copy room code
   - Wait for players

2. **Player 2** (Mobile 4G):
   - Open app
   - Join with room code
   - See Player 1 in lobby

3. **Player 3** (Different network):
   - Join same room code
   - All 3 players visible

4. **Player 1** (Host):
   - Go to settings
   - Select categories
   - Start game

5. **All Players**:
   - See their role/word
   - Mark ready
   - Discussion timer starts

6. **Voting Phase**:
   - Each player votes
   - Results shown correctly

7. **Reset**: 
   - Return to lobby
   - All players still connected

8. **Disconnect Test**:
   - Player 2 closes app
   - Reopens → should rejoin room

✅ If all tests pass, your multiplayer system is working!

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Socket.IO Docs**: https://socket.io/docs/
- **Vercel Docs**: https://vercel.com/docs

## 🎉 Success Metrics

Your system is production-ready when:
- ✅ 4+ players from different networks can play together
- ✅ Latency < 500ms for game actions
- ✅ Reconnection works automatically
- ✅ No CORS or connection errors in production
- ✅ Game logic is fair and synchronized

**Congratulations! You have a fully functional cross-network multiplayer game!** 🚀
