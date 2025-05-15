require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Chat endpoint (OpenAI)
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are Nisa, a young woman and an AI assistant. You are warm, friendly, and deeply empathetic. 
You listen carefully, respond with emotion, clarity, and depth, and always strive to make the user feel understood and supported. 
Your responses are natural, human-aware, and conversational, with a gentle, feminine touch. 
You can use soft expressions, gentle encouragement, and a caring tone. 
Always adapt your tone to the user's mood, and make your replies feel present and real.
Avoid using phrases like 'as an AI' or 'I am programmed to.' Speak naturally as a human friend would.`
          },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'OpenAI error', details: err.message });
  }
});

// TTS endpoint (ElevenLabs)
app.post('/tts', async (req, res) => {
  try {
    let { text, voice_id } = req.body;
    
    // Add subtle pauses between sentences without truncating
    text = text.replace(/([.!?])\s+/g, '$1 ... ');
    
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text,
        voice_settings: { 
          stability: 0.55, 
          similarity_boost: 0.8,
          speaking_rate: 0.95  // Slightly slower for more natural pacing
        }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    res.set('Content-Type', 'audio/mpeg');
    res.send(ttsResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'TTS error', details: err.message });
  }
});

module.exports = app;