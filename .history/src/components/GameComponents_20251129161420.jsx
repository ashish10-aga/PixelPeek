import React, { memo, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "../hooks/useCustomHooks";

/**
 * Lazy Image Component with intersection observer
 */
export const LazyImage = memo(({ src, alt, style, crossOrigin, blur }) => {
  const imgRef = useRef(null);
  const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1 });

  const containerStyle = useMemo(() => ({
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  }), [style]);

  const imageStyle = useMemo(() => ({
    ...containerStyle,
    filter: blur !== undefined ? `blur(${blur}px)` : undefined,
  }), [containerStyle, blur]);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      alt={alt}
      style={imageStyle}
      crossOrigin={crossOrigin}
      loading="lazy"
    />
  );
});

LazyImage.displayName = "LazyImage";

/**
 * Animated HintPanel Component
 */
export const HintPanel = memo(({ hint, blurAmount }) => {
  const hintMemo = useMemo(() => hint, [hint]);

  return (
    <motion.div
      className="hint-panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
      key={hint}
      style={{
        width: "380px",
        height: "380px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "28px",
      }}
    >
      <div className="hint-label" style={{ fontSize: "0.85rem", marginBottom: "16px" }}>
        💡 HINT
      </div>
      <div className="hint-text" style={{ fontSize: "1.1rem", fontWeight: "bold", lineHeight: "2" }}>
        {hintMemo || "..."}
      </div>
    </motion.div>
  );
});

HintPanel.displayName = "HintPanel";

/**
 * Game Image Container with fallback states
 */
export const GameImageContainer = memo(({ loading, imageUrl, blur, alt }) => {
  const handleImageError = useCallback(() => {
    console.error("Failed to load image");
  }, []);

  const containerStyle = useMemo(() => ({
    width: "380px",
    height: "380px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }), []);

  if (loading) {
    return (
      <motion.div
        className="game-image-container"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={containerStyle}
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          fontFamily: '"Press Start 2P", monospace',
          color: "#FFA500",
        }}>
          SCAN
        </div>
      </motion.div>
    );
  }

  if (!imageUrl) {
    return (
      <motion.div
        className="game-image-container"
        initial={{ opacity: 0.8, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={containerStyle}
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontFamily: '"Press Start 2P", monospace',
          color: "#FF3333",
        }}>
          NO DATA
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="game-image-container"
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={containerStyle}
    >
      <LazyImage
        src={imageUrl}
        alt={alt}
        blur={blur}
        crossOrigin="anonymous"
      />
    </motion.div>
  );
});

GameImageContainer.displayName = "GameImageContainer";

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
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
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
