// Moved from frontend/api/tts.js for Vercel root api deployment
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  let { text, voice_id } = req.body;

  // Add subtle pauses between sentences without truncating
  text = text.replace(/([.!?])\s+/g, '$1 ... ');

  try {
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          speaking_rate: 0.95
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
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(ttsResponse.data);
  } catch (err) {
    res.status(500).json({ error: 'TTS error', details: err.message });
  }
}
