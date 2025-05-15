# Nisa AI Chatbot

A modern, emotion-aware chatbot with high-quality voice, built with React (frontend) and Node.js/Express (backend). Integrates OpenAI GPT-4 for conversation and ElevenLabs for realistic TTS voice output.

## Features
- Emotion-aware, empathetic responses (OpenAI GPT-4)
- High-quality women's voice (ElevenLabs TTS)
- Voice input (browser STT or Whisper)
- Text input
- Modern, brandable chat UI
- Optional vibration feedback

## Project Structure

```
Nisa AI/
  backend/           # Node.js/Express API server
  frontend/          # React app (chat UI)
  README.md
```

## Setup Instructions

### 1. Clone the repo

```
git clone <repo-url>
cd 'Nisa AI'
```

### 2. Environment Variables

Create `.env` files in both `backend/` and `frontend/`:

#### backend/.env
```

```

#### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000
```

### 3. Install Dependencies

#### Backend
```
cd backend
npm install
```

#### Frontend
```
cd ../frontend
npm install
```

### 4. Run the App

#### Start Backend
```
cd backend
npm start
```

#### Start Frontend
```
cd ../frontend
npm start
```

The chatbot UI will be available at `http://localhost:3000`.

---

## APIs Used
- [OpenAI GPT-4](https://platform.openai.com/docs/api-reference/chat)
- [ElevenLabs TTS](https://docs.elevenlabs.io/api-reference/text-to-speech)

---

## Next Steps
- Implement backend API endpoints for chat and TTS
- Build React chat UI and connect to backend
- Add voice input/output and emotion-aware features 