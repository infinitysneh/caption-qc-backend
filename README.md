# 🎬 Caption QC Tool — Full Stack

AI-powered video caption quality checker. Detects spelling and grammar errors in captions from YouTube, Google Drive, SRT files, and direct uploads.

---

## 📁 Project Structure

```
caption-qc/
├── backend/          ← Node.js + Express API
│   ├── server.js
│   ├── analyzer.js
│   ├── extractors/
│   │   ├── youtube.js
│   │   ├── drive.js
│   │   └── srt.js
│   ├── Dockerfile
│   ├── railway.toml
│   └── .env.example
│
└── frontend/         ← React + Vite UI
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── .env.example
```

---

## 🚀 Deploy Backend to Railway (Recommended)

### Step 1 — Push to GitHub
```bash
cd caption-qc/backend
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/YOUR_USERNAME/caption-qc-backend.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `caption-qc-backend` repo
4. Railway auto-detects the Dockerfile ✅

### Step 3 — Set Environment Variables on Railway
In your Railway project → **Variables** tab, add:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your key from [console.anthropic.com](https://console.anthropic.com) |
| `FRONTEND_URL` | Your frontend URL (add after deploying frontend) |

### Step 4 — Get your backend URL
Railway gives you a URL like `https://caption-qc-backend-production.up.railway.app`
Save this — you'll need it for the frontend.

---

## 🌐 Deploy Frontend to Vercel (Recommended)

### Step 1 — Push to GitHub
```bash
cd caption-qc/frontend
git init
git add .
git commit -m "Initial frontend"
git remote add origin https://github.com/YOUR_USERNAME/caption-qc-frontend.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"** → import your `caption-qc-frontend` repo
3. Framework: **Vite** (auto-detected)

### Step 3 — Set Environment Variable on Vercel
In project settings → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway backend URL (e.g. `https://caption-qc-backend-production.up.railway.app`) |

### Step 4 — Deploy!
Click Deploy. Your frontend is live. 🎉

---

## 💻 Run Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
# Backend runs at http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3001
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔑 API Keys Needed

| Key | Required | Where to Get |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_DRIVE_API_KEY` | ❌ Optional | [console.cloud.google.com](https://console.cloud.google.com) — only needed for private Drive files |

---

## 📡 API Endpoints

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/analyze/youtube` | `{ "url": "https://youtube.com/watch?v=..." }` |
| POST | `/api/analyze/drive` | `{ "url": "https://drive.google.com/file/d/..." }` |
| POST | `/api/analyze/srt` | `{ "text": "1\n00:00:01..." }` |
| POST | `/api/analyze/upload` | `FormData` with `file` field |
| GET | `/health` | — |

---

## ⚠️ Notes

- **YouTube**: Video must have captions enabled. Auto-generated captions work fine.
- **Google Drive**: File must be a `.srt`, `.vtt`, or `.txt` caption file set to "Anyone with the link can view".
- **Large files**: Only the first ~12,000 characters of captions are analyzed per request.
