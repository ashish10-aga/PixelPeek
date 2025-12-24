import React, { memo, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";

/* Heavy components (LazyImage, HintPanel, GameImageContainer) have been moved to `src/components/HeavyComponents.jsx` and are lazy-loaded from the app to enable bundle splitting. */

/**
 * Score Display Component with memoization
 */
export const ScoreDisplay = memo(({ score, highScore }) => {
  const scoreStyle = useMemo(() => ({
    fontSize: "2rem",
    lineHeight: "1",
  }), []);

  const highScoreStyle = useMemo(() => ({
    fontSize: "0.6rem",
    fontFamily: '"Press Start 2P", monospace',
    color: "#FFA500",
  }), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div className="shiny-score" style={scoreStyle}>
        {score}
      </div>
      <div style={highScoreStyle}>
        HIGH {highScore}
      </div>
    </div>
  );
});

ScoreDisplay.displayName = "ScoreDisplay";

/**
 * Guess Input and Buttons Component
 */
export const GuessForm = memo(({ guess, onGuessChange, onSubmit, onSkip, revealed }) => {
  const inputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit();
    if (inputRef.current) inputRef.current.focus();
  }, [onSubmit]);

  // Keep space reserved for the controls when the answer is revealed.
  // Returning null caused the parent flex layout to reflow and collapse other sections.
  if (revealed) {
    return (
      <div
        className="guess-placeholder"
        aria-hidden="true"
        style={{ width: "100%", height: "80px", flexShrink: 0 }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="guess-form"
      style={{
        width: "100%",
        flexShrink: 0,
      }}
    >
      <input
        ref={inputRef}
        value={guess}
        onChange={(e) => onGuessChange(e.target.value)}
        placeholder="TYPE GUESS"
        className="guess-input"
        style={{ width: "220px", fontSize: "1rem" }}
        autoFocus
      />
      <button
        className="retro-btn retro-btn-red"
        type="submit"
        style={{ fontSize: "0.9rem", padding: "14px 20px", flexShrink: 0 }}
      >
        GUESS
      </button>
      <button
        className="retro-btn retro-btn-blue"
        onClick={onSkip}
        style={{ fontSize: "0.9rem", padding: "14px 20px", flexShrink: 0 }}
        type="button"
      >
        SKIP
      </button>
    </form>
  );
});

GuessForm.displayName = "GuessForm";

/**
 * Attempts Counter Component
 */
export const AttemptsCounter = memo(({ attempts, maxAttempts }) => {
  const percentage = useMemo(() => Math.round((attempts / maxAttempts) * 100), [attempts, maxAttempts]);

  return (
    <div className="attempts-counter">
      <div className="attempts-text">ATTEMPTS: {attempts} / {maxAttempts}</div>
      <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
        <div className={`progress-fill ${percentage > 80 ? 'danger' : ''}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
});

AttemptsCounter.displayName = "AttemptsCounter";

/**
 * Answer Reveal Component
 */
export const AnswerReveal = memo(({ label, onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <motion.div
        className="answer-reveal"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ minWidth: "300px" }}
      >
        {label.toUpperCase()}
      </motion.div>
      <button
        className="retro-btn retro-btn-green"
        onClick={onNext}
        style={{
          fontSize: "1rem",
          padding: "16px 32px",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        NEXT
      </button>
    </motion.div>
  );
});

AnswerReveal.displayName = "AnswerReveal";
