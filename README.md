# Imposter Guess Word - WebSocket Multiplayer Edition

A social deduction party game with **reliable cross-network multiplayer** using WebSockets (Socket.IO).

## 🎮 Features

- ✅ **Cross-network play** - Works on 4G, WiFi, corporate networks, different countries
- ✅ **Mobile-friendly** - Reliable on mobile networks (not possible with WebRTC P2P)
- ✅ **Anti-cheat** - Server validates all actions
- ✅ **Auto-reconnect** - Resume game after disconnect
- ✅ **100% Free** - Hosted on Render (backend) + Vercel (frontend)
- ✅ **Offline mode** - Single-device local play

## 🚀 Quick Start

### Option 1: Use Deployed Version (Easiest)

If you've already deployed:
1. Open your Vercel URL
2. Create or join a room
3. Share room code with friends
4. Play!

### Option 2: Run Locally

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Set up environment variables
# Backend:
cd backend
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (or leave blank for fallback words)

# Frontend:
cd ..
cp .env.example .env
# Edit .env: VITE_SERVER_URL=http://localhost:3001

# 3. Run (two terminals)
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev

# 4. Open http://localhost:5173 in two tabs to test
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Step-by-step guide to deploy to Render + Vercel |
| **[TECHNICAL_EXPLANATION.md](TECHNICAL_EXPLANATION.md)** | Why WebSockets? Architecture details |
| **[walkthrough.md](.gemini/antigravity/brain/*/walkthrough.md)** | Complete implementation walkthrough |
| [backend/README.md](backend/README.md) | Backend API documentation |

## 🛠 Tech Stack

### Backend (Render)
- Node.js + Express
- Socket.IO (WebSocket server)
- OpenAI API (word generation)

### Frontend (Vercel)
- React + TypeScript
- Vite
- Socket.IO Client

## 🌐 Deploy to Production

### 1. Backend (Render)

See [DEPLOYMENT.md](DEPLOYMENT.md#backend-deployment-render) for detailed steps.

**Quick version:**
1. Create Web Service on Render.com
2. Connect GitHub repo
3. Set root directory: `backend`
4. Add environment variables
5. Deploy

### 2. Frontend (Vercel)

```bash
# Set environment variable
echo "VITE_SERVER_URL=https://your-render-app.onrender.com" > .env

# Deploy
vercel --prod
```

## 🧪 Testing

Test with players on:
- ✅ Different WiFi networks
- ✅ Mobile data (4G/5G)
- ✅ Different countries
- ✅ Desktop + mobile

See [DEPLOYMENT.md - Testing](DEPLOYMENT.md#testing-multiplayer) for detailed test plan.

## 🔥 Key Changes from Original

### Replaced PeerJS with Socket.IO

**Why?**
- PeerJS (WebRTC P2P) fails on mobile networks and across different ISPs
- WebSockets work everywhere HTTPS works (99% success rate)
- Server validates actions (prevents cheating)

**What Changed:**
- [services/gameService.ts](services/gameService.ts) - Completely rewritten
- [services/aiService.ts](services/aiService.ts) - Now a stub (server handles AI)
- New `backend/` folder - All server code

See [TECHNICAL_EXPLANATION.md](TECHNICAL_EXPLANATION.md) for full rationale.

## ❓ FAQ

**Q: Does this cost money?**  
A: No! Render free tier (backend) + Vercel free tier (frontend) = $0/month

**Q: Will it work on mobile data?**  
A: Yes! WebSockets work reliably on 4G/5G (WebRTC P2P often fails)

**Q: What about Render's 15-minute idle spin down?**  
A: First player to join after 15min idle waits ~60s for server to wake up. After that, instant.

**Q: How many players can play at once?**  
A: Free tier supports ~100 concurrent players (20 rooms × 5 players)

**Q: Do I need an OpenAI API key?**  
A: No - fallback words work fine. API key is optional for better word variety.

## 📦 Project Structure

```
imposter-guess-word/
├── backend/               # Node.js Socket.IO server
│   ├── server.js          # Main server
│   ├── gameManager.js     # Room management
│   ├── gameLogic.js       # Game rules
│   └── aiService.js       # Word generation
│
├── services/
│   ├── gameService.ts     # Socket.IO client
│   └── aiService.ts       # Stub
│
├── components/            # React UI components
├── DEPLOYMENT.md          # Deployment guide
└── TECHNICAL_EXPLANATION.md  # Technical details
```

## 🎯 Success Metrics

Your system is ready when:
- ✅ Players from different networks can play together
- ✅ Mobile 4G works reliably
- ✅ Reconnection is automatic
- ✅ No cheating possible (server validates)

## 🆘 Troubleshooting

**Can't connect to server:**
- Check `VITE_SERVER_URL` in `.env`
- Verify Render deployment is running
- Test: `https://your-app.onrender.com/health`

**CORS errors:**
- Update `FRONTEND_URL` in Render environment variables
- Must match Vercel URL exactly (include `https://`)

Full troubleshooting: [DEPLOYMENT.md - Troubleshooting](DEPLOYMENT.md#troubleshooting)

## 📄 License

MIT

## 🙏 Credits

Built with:
- Socket.IO - Real-time communication
- Render - Free backend hosting
- Vercel - Free frontend hosting

---

**Ready to play? [Deploy now](DEPLOYMENT.md) or [run locally](#option-2-run-locally)** 🚀
