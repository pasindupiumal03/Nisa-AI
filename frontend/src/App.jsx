import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

// Simple emotion detection based on keywords
function detectEmotion(text) {
  if (/calm|relaxed|peaceful|soothing|gentle|serene/i.test(text)) return 'calm';
  if (/excited|amazing|awesome|fantastic|great|wow|yay|energy|enthusiastic/i.test(text)) return 'excited';
  if (/sad|sorry|unfortunately|regret|disappointed|upset/i.test(text)) return 'sad';
  if (/angry|frustrated|annoyed|mad|irritated/i.test(text)) return 'angry';
  if (/happy|joy|delighted|smile|cheerful|glad/i.test(text)) return 'happy';
  return 'neutral';
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-block', minWidth: 32 }}>
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginRight: 2 }}
      >.</motion.span>
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
        style={{ marginRight: 2 }}
      >.</motion.span>
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
      >.</motion.span>
    </span>
  );
}

// Waveform animation for voice input
function Waveform({ active }) {
  const barCount = 7;
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginRight: 10, height: 24 }}>
      {[...Array(barCount)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0.5 }}
          animate={active ? { scaleY: [0.5, 1.4, 0.5] } : { scaleY: 0.5 }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut"
          }}
          style={{
            width: 3,
            height: 18,
            margin: '0 1px',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6c63ff 60%, #48c6ef 100%)',
            opacity: 0.85
          }}
        />
      ))}
    </div>
  );
}

const exampleQuestions = [
  { text: "Can you help me relax with a calming story?", emotion: "calm" },
  { text: "Tell me something amazing that happened today!", emotion: "excited" },
  { text: "I'm feeling a bit down, can you cheer me up?", emotion: "sad" },
  { text: "Why do people get angry sometimes?", emotion: "angry" },
  { text: "Share a happy memory with me!", emotion: "happy" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);
  const [manualListening, setManualListening] = useState(false);

  // Voice recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Advanced mic logic: manual start/stop
  useEffect(() => {
    if (manualListening && !listening) {
      SpeechRecognition.startListening({ continuous: true });
    }
    if (!manualListening && listening) {
      SpeechRecognition.stopListening();
    }
    // eslint-disable-next-line
  }, [manualListening]);

  // Send message (text or voice)
  const sendMessage = async (text) => {
    setSelectedExample(null);
    setLoading(true);
    setMessages((msgs) => [...msgs, { from: "user", text }]);
    setValue(""); // Clear input after sending
    setIsTyping(true);
    try {
      // Simulate typing delay
      setTimeout(async () => {
        // Get GPT reply
        const chatRes = await axios.post(`${API_URL}/chat`, { message: text });
        const reply = chatRes.data.reply;
        const emotion = detectEmotion(reply);
        setMessages((msgs) => [...msgs, { from: "bot", text: reply, emotion }]);
        setIsTyping(false);
        // Get TTS audio
        const ttsRes = await axios.post(
          `${API_URL}/tts`,
          { text: reply, voice_id: DEFAULT_VOICE_ID },
          { responseType: "arraybuffer" }
        );
        const audioUrl = URL.createObjectURL(new Blob([ttsRes.data], { type: "audio/mpeg" }));
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          if (navigator.vibrate) navigator.vibrate(15);
        }
        setLoading(false);
      }, 1200); // 1.2s typing delay
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, something went wrong.", emotion: 'sad' }]);
      setIsTyping(false);
      setLoading(false);
    }
  };

  // Handle mic button (toggle manual listening)
  const handleMic = () => {
    if (manualListening) {
      setManualListening(false);
      if (transcript.trim()) {
        sendMessage(transcript.trim());
        resetTranscript();
      }
    } else {
      resetTranscript();
      setManualListening(true);
    }
  };

  // Emotion-based bubble style
  const getBotBubbleStyle = (emotion) => {
    let base = {
      fontWeight: 600,
      textShadow: '0 1px 8px #000, 0 0px 2px #000',
      fontSize: '1.08rem',
      lineHeight: 1.5,
      borderRadius: 32,
      fontFamily: `'Playfair Display', 'Cormorant Garamond', serif`,
    };
    switch (emotion) {
      case 'calm':
        return {
          ...base,
          background: 'rgba(100, 149, 237, 0.18)',
          boxShadow: '0 0 12px 2px #6495ed55',
          color: '#fff',
        };
      case 'excited':
        return {
          ...base,
          background: 'rgba(255, 255, 120, 0.18)',
          boxShadow: '0 0 16px 4px #ffe06699',
          color: '#fff',
        };
      case 'sad':
        return {
          ...base,
          background: 'rgba(120, 120, 255, 0.10)',
          boxShadow: '0 0 8px 2px #a0a0ff55',
          color: '#fff',
        };
      case 'angry':
        return {
          ...base,
          background: 'rgba(255, 80, 80, 0.18)',
          boxShadow: '0 0 12px 2px #ff505055',
          color: '#fff',
        };
      case 'happy':
        return {
          ...base,
          background: 'rgba(144, 238, 144, 0.18)',
          boxShadow: '0 0 12px 2px #90ee9055',
          color: '#fff',
        };
      default:
        return {
          ...base,
          background: 'rgba(255,255,255,0.10)',
          color: '#fff',
        };
    }
  };

  // Input area styled like 21st.dev
  const InputArea = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: '1.5px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      boxShadow: '0 4px 32px 0 rgba(31,38,135,0.10)',
      padding: '0.5rem 1rem',
      marginTop: '1rem',
      width: '100%',
      transition: 'box-shadow 0.2s',
    }}>
      {manualListening && <Waveform active={manualListening} />}
      <input
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '1.1rem',
          padding: '1rem 0',
          outline: 'none',
        }}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && value.trim() && sendMessage(value)}
        placeholder="Tell Nisa your question..."
        disabled={loading}
      />
      {browserSupportsSpeechRecognition && (
        <button
          onClick={handleMic}
          style={{
            background: manualListening ? 'linear-gradient(135deg, #48c6ef99 60%, #6c63ff99 100%)' : 'linear-gradient(135deg, #6c63ff99 60%, #48c6ef99 100%)',
            opacity: 0.7,
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '0.6rem 1rem',
            marginLeft: 8,
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: manualListening ? '0 0 0 2px #48c6ef88' : undefined,
            position: 'relative',
            overflow: 'visible',
          }}
          title={manualListening ? "Stop Listening" : "Speak"}
          disabled={loading}
        >
          {/* Animated pulsing glow when idle */}
          {!manualListening && (
            <span style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              zIndex: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle, #6c63ff55 0%, #48c6ef22 80%, transparent 100%)',
              animation: 'mic-pulse 1.6s infinite',
              opacity: 0.7,
            }} />
          )}
          <FaMicrophone style={{ position: 'relative', zIndex: 1 }} />
        </button>
      )}
      <button
        onClick={() => value.trim() && sendMessage(value)}
        style={{
          background: 'linear-gradient(135deg, #6c63ff99 60%, #48c6ef99 100%)',
          opacity: 0.7,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '0.6rem 1rem',
          marginLeft: 8,
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        disabled={loading}
      >
        <FaPaperPlane />
      </button>
    </div>
  );

    return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-black text-white p-6 relative overflow-hidden">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet" />

      {/* Gradient background */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120vw', height: '120vh', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 60% 40%, #a259ff 0%, #3f51b5 40%, #ff6f91 100%)',
        opacity: 0.32, filter: 'blur(80px)'
      }} />

      {/* Animated background blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] animate-pulse delay-700" />
      </div>

      {/* Header & Example prompts */}
      <div className="text-center space-y-3 mb-8" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 className="animated-gradient-text">Hi, I'm Nisa</h1>
        <p className="text-sm text-white/40">Type or speak your question</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: 16 }}>
          {exampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => { setSelectedExample(i); sendMessage(q.text); }}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: 18, border: 'none', fontWeight: 500,
                fontSize: '1rem', cursor: 'pointer', background: selectedExample === i
                  ? 'linear-gradient(90deg, #3fd0ff 0%, #c084fc 100%)'
                  : 'rgba(255,255,255,0.07)', color: selectedExample === i ? '#fff' : '#aeeaff',
                boxShadow: selectedExample === i ? '0 2px 12px 2px #3fd0ff44' : 'none',
                transition: 'all 0.2s', outline: selectedExample === i ? '2px solid #3fd0ff' : 'none'
              }}>
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat container */}
      <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
        style={{ width: '100%', maxWidth: 700, minWidth: 300, margin: '0 auto',
          display: 'flex', flexDirection: 'column', minHeight: '60vh', height: '65vh', justifyContent: 'flex-end' }}>

        {/* Chat messages */}
        <div className="p-4 nisa-chat-log" style={{ minHeight: 300, flex: 1, overflowY: 'auto',
          maxHeight: 'calc(65vh - 80px)', padding: '2rem 2.2rem 1.2rem 2.2rem',
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {messages.length === 0 ? <div style={{ height: 120 }} /> : (
            <>
              {messages.map((msg, i) => (
                <motion.div key={i} className={`mb-2 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 32, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7, delay: i * 0.05 }}>
                  <span className="px-4 py-2"
                    style={msg.from === "user"
                      ? { background: "#2563eb", color: "#fff", fontWeight: 600,
                          fontSize: '1.08rem', lineHeight: 1.5, borderRadius: 18, fontFamily: 'inherit' }
                      : getBotBubbleStyle(msg.emotion)}>
                    {msg.text}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div className="mb-2 flex justify-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff',
                    fontWeight: 600, fontSize: '1.08rem', lineHeight: 1.5,
                    textShadow: '0 1px 8px #000, 0 0px 2px #000', boxShadow: '0 0 12px 2px #222a',
                    minWidth: 60, display: 'flex', alignItems: 'center', borderRadius: 32, fontFamily: 'serif' }}>
                    Nisa is typing <TypingDots />
                  </span>
                </motion.div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/[0.05] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.01)', position: 'sticky', bottom: 0, zIndex: 2,
            padding: '1.2rem 2.2rem', boxSizing: 'border-box' }}>
          {InputArea}
        </div>
        <audio ref={audioRef} />
      </div>
    </div>
  );
}