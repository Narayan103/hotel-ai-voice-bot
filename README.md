# 🏨 Hotel AI Voice Bot

A production-level AI voice customer support bot for hotel use cases.
Built step-by-step with industry-level code quality.

## Tech Stack

- **Frontend:** React 18 (hooks, component architecture)
- **Backend:** Flask (Python)
- **Voice I/O:** Web Speech API (SpeechRecognition + SpeechSynthesis)
- **NLP:** scikit-learn intent detection
- **Deployment:** Vercel (frontend) + Render (backend)
- **Cost:** $0 — zero paid APIs

---

## Architecture
User speaks → Web Speech API → React frontend
↓ HTTP POST /api/chat
Flask backend
↓
Intent detector (ML)
↓
Response engine
↓
JSON response
↓
React UI + SpeechSynthesis

---

## Project Structure
hotel-bot/
├── frontend/                   # React app
│   └── src/
│       ├── components/         # UI components
│       │   ├── ChatWindow.jsx      # Container: owns state + logic
│       │   ├── MessageBubble.jsx   # Presentational: renders one message
│       │   ├── VoiceButton.jsx     # Mic button (3 states: idle/listening/loading)
│       │   └── TypingIndicator.jsx # Animated dots while bot processes
│       ├── hooks/              # Custom React hooks (Step 3+)
│       ├── services/           # API call logic (Step 4+)
│       └── utils/              # Pure helper functions
│
└── backend/                    # Flask API
└── app/
├── routes/             # API endpoints (Step 4+)
├── services/           # Intent detection, response engine
└── data/               # Hotel data (rooms, pricing)

---

## Key Concepts Implemented

### Step 1 — Project Scaffold
- Decoupled client-server architecture
- Python virtual environment for dependency isolation
- CORS configuration for cross-origin requests
- Environment variables via `.env` (no hardcoded secrets)
- Conventional commits (`feat:`, `fix:`, `chore:`)

### Step 2 — Chat UI
- **Container vs Presentational** component pattern
- **Finite state machine** on VoiceButton (idle → listening → loading)
- **Functional state updates** (`prev => [...prev, msg]`) to prevent stale closure bugs
- **Optimistic UI** — user message appears instantly before API responds
- **Auto-scroll** via `useRef` + `scrollIntoView`
- **`finally` block** ensures loading state always resets even on error
- Animated typing indicator (perceived performance)
- Intent tags on bot messages (explainability)

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

---

## Progress

| Step | Feature | Status |
|------|---------|--------|
| 1 | Project scaffold + GitHub setup | ✅ Done |
| 2 | Chat UI (components + state) | ✅ Done |
| 3 | Voice input (Web Speech API) | 🔜 Next |
| 4 | Backend API + intent detection | ⬜ Pending |
| 5 | Voice output (SpeechSynthesis) | ⬜ Pending |
| 6 | Deployment (Vercel + Render) | ⬜ Pending |

---

## How to Explain This Project in Interviews

**One-line summary:**
> "A full-stack voice chatbot for hotel customer support — React frontend with Web Speech API, Flask backend with ML-based intent detection, zero paid APIs."

**Key talking points:**
- Why you used functional state updates (stale closure prevention)
- Container vs presentational component pattern
- How CORS works and why it's needed
- How the intent detection model was trained

---

## Interview Questions This Project Covers

- What is a stale closure in React and how do you prevent it?
- What is the difference between `useRef` and `useState`?
- What does CORS do and why do browsers enforce it?
- What is a finite state machine? Where did you use one?
- What is the difference between a container and presentational component?
- How does `useEffect` with a dependency array work?
- What does the `finally` block guarantee?

---

## Author

Built as a portfolio project to demonstrate production-level full-stack + AI engineering skills.