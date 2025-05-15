// Minimal test function to check axios resolution in Vercel
export default function handler(req, res) {
  try {
    const axios = require('axios');
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
