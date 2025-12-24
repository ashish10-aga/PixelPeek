import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { generateLabelFromAI } from "./lib/aiImageLabel.js";
import { generateHintFromAI } from "./lib/gemini.js";

const CATEGORIES = [
  "nature", "animals", "technology", "food", "architecture",
  "people", "art", "sports", "travel", "abstract", "space", "cars"
];

// Starfield background component
function Starfield() {
  useEffect(() => {
    const starfieldEl = document.querySelector(".starfield");
    if (!starfieldEl) return;

    starfieldEl.innerHTML = "";
    for (let i = 0; i < 150; i++) {
      const star = document.createElement("div");
      star.className = `star ${["small", "medium", "large"][Math.floor(Math.random() * 3)]}`;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      star.style.left = x + "px";
      star.style.top = y + "px";
      if (Math.random() > 0.4) {
        star.classList.add("twinkling");
        star.style.animationDelay = Math.random() * 3 + "s";
      }
      starfieldEl.appendChild(star);
    }
  }, []);

  return <div className="starfield"></div>;
}

export default function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [label, setLabel] = useState("");
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blur, setBlur] = useState(20);
  const [hint, setHint] = useState("Loading...");
  const [hintLevel, setHintLevel] = useState(0);
  const [previousHints, setPreviousHints] = useState([]);
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef();

  useEffect(() => {
    const stored = localStorage.getItem("pixelpeek_highscore");
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const loadNewImage = async () => {
    try {
      setLoading(true);
      setRevealed(false);
      setGuess("");
      setScore(100);
      setAttempts(0);
      setBlur(20);
      setHint("Loading...");
      setHintLevel(0);
      setPreviousHints([]);

      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      
      const url = `https://api.unsplash.com/photos/random?query=${category}&w=600&h=600&fit=crop&client_id=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const imageUrl = data?.urls?.regular;
      const desc = data?.alt_description || data?.description || category;
      const tags = (data?.tags || data?.tags_preview || []).map((t) => t.title);

      setImageUrl(imageUrl);
      setHint("What's hidden in the blur?");

      try {
        const aiLabel = await generateLabelFromAI(desc, tags);
        setLabel(aiLabel);
      } catch (e) {
        setLabel(desc);
      }

      try {
        const firstHint = await generateHintFromAI(desc, 0, [], label);
        setHint(firstHint);
      } catch (e) {
        setHint("Take a good look...");
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setHint("Error loading image");
    }
  };

  useEffect(() => {
    loadNewImage();
  }, []);

  const normalize = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const isCorrect = (g, l) => {
    g = normalize(g);
    l = normalize(l);
    return g === l || g.includes(l) || l.includes(g);
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    if (revealed) return;

    if (isCorrect(guess, label)) {
      setRevealed(true);
      setBlur(0);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("pixelpeek_highscore", String(score));
      }
    } else {
      setAttempts((a) => a + 1);
      setScore((s) => Math.max(0, s - 15));
      setBlur((b) => Math.max(0, b - 3));
      const lvl = hintLevel + 1;

      setHint("Thinking...");

      try {
        const nextHint = await generateHintFromAI(label, lvl, [...previousHints, hint], label);
        setHint(nextHint);
      } catch (e) {
        setHint("Keep guessing...");
      }
      
      setHintLevel(lvl);
      setPreviousHints((p) => [...p, hint]);

      if (score <= 15) {
        setRevealed(true);
        setBlur(0);
      }
    }
    setGuess("");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Starfield />

      {/* TOP BAR */}
      <div className="relative z-20 flex justify-between items-center px-8 pt-6 pb-4 border-b-4" style={{ borderColor: "#FFD700" }}>
        <div className="flex-1 text-center">
          <motion.h1
            className="pixel-title"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            PIXELPEEK
          </motion.h1>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <div className="shiny-score text-6xl leading-none">{score}</div>
          <div style={{ fontSize: "0.7rem", fontFamily: '"Press Start 2P", monospace', color: "#FFA500", textShadow: "0 0 10px rgba(255, 165, 0, 0.6)" }}>
            HIGH
          </div>
          <div style={{ fontSize: "0.8rem", fontFamily: '"Press Start 2P", monospace', color: "#FFA500" }}>
            {highScore}
          </div>
        </div>
      </div>

      {/* MAIN GAME AREA */}
      <div className="flex items-center justify-center px-4 pb-8 gap-4" style={{ height: "calc(100vh - 120px)" }}>
        
        {/* LEFT BUTTONS - COMPACT */}
        <div className="hidden md:flex flex-col gap-4 justify-center flex-shrink-0">
          {!revealed ? (
            <>
              <button
                className="retro-btn retro-btn-red"
                onClick={handleGuess}
                style={{ width: "140px", fontSize: "0.75rem", padding: "14px 10px", fontWeight: "bold" }}
              >
                GUESS
              </button>
              <button
                className="retro-btn retro-btn-blue"
                onClick={loadNewImage}
                style={{ width: "140px", fontSize: "0.75rem", padding: "14px 10px", fontWeight: "bold" }}
              >
                SKIP
              </button>
            </>
          ) : (
            <button
              className="retro-btn retro-btn-green"
              onClick={loadNewImage}
              style={{ width: "140px", fontSize: "0.75rem", padding: "14px 10px", fontWeight: "bold" }}
            >
              NEXT
            </button>
          )}
        </div>

        {/* CENTER IMAGE */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <motion.div
            className="game-image-container"
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="w-full h-full flex items-center justify-center" style={{ fontSize: "1rem", fontFamily: '"Press Start 2P", monospace', color: "#FFA500" }}>
                LOAD
              </div>
            ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Guess"
                  className="w-full h-full object-cover"
                  style={{ filter: `blur(${blur}px)`, display: "block", width: "100%", height: "100%" }}
                  crossOrigin="anonymous"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-red-500" style={{ fontSize: "0.7rem", fontFamily: '"Press Start 2P", monospace' }}>
                  NO IMAGE
                </div>
              )}
          </motion.div>

          {revealed && (
            <motion.div
              className="answer-reveal"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ minWidth: "300px" }}
            >
              {label.toUpperCase()}
            </motion.div>
          )}

          {!revealed && (
            <form onSubmit={handleGuess} className="hidden md:flex gap-2 items-center">
              <input
                ref={inputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="TYPE"
                className="guess-input"
                style={{ width: "200px", fontSize: "0.65rem" }}
                autoFocus
              />
              <button
                className="retro-btn retro-btn-green"
                type="submit"
                style={{ fontSize: "0.65rem", padding: "8px 12px" }}
              >
                SEND
              </button>
            </form>
          )}

          <div className="md:hidden flex gap-2">
            {!revealed ? (
              <>
                <button className="retro-btn retro-btn-red" onClick={handleGuess} style={{ fontSize: "0.6rem", padding: "10px 8px" }}>
                  GUESS
                </button>
                <button className="retro-btn retro-btn-blue" onClick={loadNewImage} style={{ fontSize: "0.6rem", padding: "10px 8px" }}>
                  SKIP
                </button>
              </>
            ) : (
              <button className="retro-btn retro-btn-green" onClick={loadNewImage} style={{ fontSize: "0.6rem", padding: "10px 8px" }}>
                NEXT
              </button>
            )}
          </div>

          {!revealed && (
            <form onSubmit={handleGuess} className="md:hidden w-full flex gap-1">
              <input ref={inputRef} value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="TYPE" className="guess-input" style={{ flex: 1, fontSize: "0.6rem" }} />
            </form>
          )}
        </div>

        {/* RIGHT HINT - ALWAYS VISIBLE */}
        <div className="hidden md:flex flex-col justify-center flex-shrink-0">
          <motion.div
            key={hint}
            className="hint-panel"
            style={{ minWidth: "280px", maxWidth: "320px", maxHeight: "400px" }}
            initial={{ opacity: 0.5, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="hint-label" style={{ fontSize: "0.75rem" }}>💡 HINT</div>
            <div className="hint-text" style={{ fontSize: "0.9rem", fontWeight: "bold", lineHeight: "1.4" }}>
              {hint || "Thinking..."}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
