# 🏨 Hotel AI Voice Bot

A production-level AI voice customer support bot for hotel use cases.

## Tech Stack
- **Frontend:** React (hooks, Web Speech API)
- **Backend:** Flask (Python)
- **NLP:** scikit-learn intent detection (zero paid APIs)
- **Voice:** Browser SpeechRecognition + SpeechSynthesis

## Features
- 🎤 Voice input via microphone
- 🧠 Intent detection (book room, pricing, availability)
- 💬 Conversational chat UI
- 🔊 Text-to-speech responses
- 📱 Responsive design

## Setup

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Project Status
- [x] Step 1: Project scaffold
- [ ] Step 2: Chat UI
- [ ] Step 3: Voice input
- [ ] Step 4: Backend API + intent detection
- [ ] Step 5: Voice output
- [ ] Step 6: Deployment