import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { generateHintFromAI } from "./lib/gemini.js";
import { validateAnswerAdvanced, generateContextualHint } from "./lib/advancedAnswerValidator.js";
import { GameProvider, useGame, GAME_ACTIONS } from "./context/GameContext";
import { 
  useLocalStorage, 
  useAsync, 
  useDebounce, 
  usePerformanceMetrics,
  useOnMount,
  useWindowSize 
} from "./hooks/useCustomHooks";
import { 
  ScoreDisplay, 
  GuessForm, 
  AttemptsCounter, 
  AnswerReveal 
} from "./components/GameComponents";

// Lazy-load heavier UI parts to reduce initial bundle and improve TTI.
const GameImageContainer = React.lazy(() => import("./components/HeavyComponents").then(mod => ({ default: mod.GameImageContainer })));
const HintPanel = React.lazy(() => import("./components/HeavyComponents").then(mod => ({ default: mod.HintPanel })));
import ErrorBoundary from "./components/ErrorBoundary";
import { fetchImageFromUnsplash, preloadImages, fetchWithRetry } from "./lib/apiService";
import { initializeCache } from "./lib/cacheManager";
import { performanceLogger, analyticsService, measurePerformanceAsync } from "./lib/logger";

const CATEGORIES = [
  "nature", "animals", "technology", "food", "architecture",
  "people", "art", "sports", "travel", "abstract", "space", "cars"
];

const MAX_ATTEMPTS = 5;
const BLUR_DECREMENT = 4;
const INITIAL_BLUR = 20;
const SCORE_DECREMENT = 15;

/**
 * Starfield Component - Memoized canvas animation
 */
const Starfield = React.memo(() => {
  usePerformanceMetrics("Starfield");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const starfieldEl = document.querySelector(".starfield");
    if (!starfieldEl) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "0";
    
    starfieldEl.innerHTML = "";
    starfieldEl.appendChild(canvas);
    
    const ctx = canvas.getContext("2d");
    const stars = [];
    
    // Create stars with better quality
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinkleAmount: 0
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Move stars down (space walk effect)
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }
        
        // Twinkle effect
        star.twinkleAmount += star.twinkleSpeed;
        if (star.twinkleAmount > 1) star.twinkleAmount = 0;
        
        const twinkle = Math.sin(star.twinkleAmount * Math.PI) * 0.5 + 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius + 1, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <div className="starfield"></div>;
});

/**
 * Main Game Logic Component
 */
function GameBoard() {
  const { state, dispatch } = useGame();
  const windowSize = useWindowSize();
  const performanceMetrics = usePerformanceMetrics("GameBoard");

  // Normalize and compare strings - REPLACED WITH ADVANCED VALIDATOR
  const normalize = useCallback((t) => 
    t.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(),
    []
  );

  const isCorrect = useCallback((guess, label, description) => {
    // Use advanced validator instead of simple string matching
    // This will be called asynchronously in handleGuess
    return { guess, label, description };
  }, []);

  // Load new image with caching and preloading
  const loadNewImage = useCallback(async () => {
    try {
      dispatch({ type: GAME_ACTIONS.RESET_GAME });

      performanceLogger.startMeasure("loadImage");

      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

      // Fetch with retry logic
      const imageData = await fetchWithRetry(
        () => fetchImageFromUnsplash(category),
        3
      );

      const loadTime = performanceLogger.endMeasure("loadImage");
      analyticsService.trackImageLoad(loadTime, "unsplash");

      dispatch({ type: GAME_ACTIONS.SET_IMAGE, payload: imageData.imageUrl });
      dispatch({ type: GAME_ACTIONS.SET_DESC, payload: imageData.description });
      dispatch({ type: GAME_ACTIONS.SET_LABEL, payload: imageData.description });
      dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Scanning image..." });

      // Generate first hint asynchronously
      try {
        const firstHint = await generateHintFromAI(imageData.description, 0, [], imageData.description);
        dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> " + firstHint });
      } catch (e) {
        console.error("Hint generation failed:", e);
        dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Image loaded. Begin guessing..." });
      }

      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: false });

      // Preload next batch of images in background
      preloadImages(CATEGORIES, 3).catch((err) => console.warn("Preload error:", err));
    } catch (err) {
      console.error("Load image error:", err);
      dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> ERROR: Unable to load" });
      dispatch({ type: GAME_ACTIONS.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // Load image on component mount
  useOnMount(() => {
    initializeCache().then(() => loadNewImage());
  });

  // Preload next images when answer revealed to smooth transition
  useEffect(() => {
    if (state.revealed) {
      preloadImages(CATEGORIES, 3).catch((err) => console.warn("Preload error:", err));
    }
  }, [state.revealed]);

  // Initialize theme switcher button in header
  useEffect(() => {
    const header = document.querySelector('.app-header');
    if (!header) return;

    // Import ThemeUI dynamically to avoid circular imports
    import('./js/theme-ui').then((module) => {
      const ThemeUI = module.default;
      const switcherContainer = ThemeUI.buildInGameSwitcher();
      
      // Insert before the header spacer
      const spacer = header.querySelector('.header-spacer');
      if (spacer) {
        header.insertBefore(switcherContainer, spacer);
      } else {
        header.appendChild(switcherContainer);
      }
    }).catch((err) => console.warn('Failed to load theme UI:', err));
  }, []);

  // Handle guess submission with advanced answer validation
  const handleGuess = useCallback(async (e) => {
    e?.preventDefault?.();
    
    if (state.revealed || state.loading) return;

    // Show processing state
    dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Validating answer..." });

    try {
      // Use advanced validator with semantic matching
      const validation = await validateAnswerAdvanced(
        state.guess,
        state.label,
        state.desc
      );

      analyticsService.trackGuessAttempt(state.guess, validation.isValid);

      if (validation.isValid) {
        // CORRECT ANSWER
        analyticsService.trackGuessAttempt(state.guess, true);
        analyticsService.trackGameScore(state.score, true, state.hintLevel, state.label);

        dispatch({ type: GAME_ACTIONS.REVEAL_ANSWER });
        dispatch({ 
          type: GAME_ACTIONS.SET_HINT, 
          payload: `> CORRECT! (${validation.strategy}) - Score: ${Math.round(state.score)}` 
        });

        if (state.score > state.highScore) {
          dispatch({ type: GAME_ACTIONS.SET_HIGH_SCORE, payload: state.score });
        }

        console.log("Answer validation result:", {
          guess: state.guess,
          answer: state.label,
          confidence: validation.confidence,
          strategy: validation.strategy,
          score: validation.score,
        });
      } else {
        // INCORRECT ANSWER
        const newAttempts = state.attempts + 1;
        dispatch({ type: GAME_ACTIONS.INCREMENT_ATTEMPTS });
        dispatch({ type: GAME_ACTIONS.DECREMENT_SCORE, payload: SCORE_DECREMENT });

        // Progressive blur reveal
        const newBlur = Math.max(0, state.blur - BLUR_DECREMENT);
        dispatch({ type: GAME_ACTIONS.SET_BLUR, payload: newBlur });

        if (newAttempts >= MAX_ATTEMPTS) {
          // GAME OVER
          analyticsService.trackGameScore(0, false, state.hintLevel, state.label);
          dispatch({ type: GAME_ACTIONS.REVEAL_ANSWER });
          dispatch({ type: GAME_ACTIONS.SET_SCORE, payload: 0 });
          dispatch({ 
            type: GAME_ACTIONS.SET_HINT, 
            payload: `> GAME OVER (5 attempts). Answer: ${state.label.toUpperCase()}` 
          });
        } else {
          // GENERATE CONTEXTUAL HINT based on incorrect guess
          dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Analyzing your guess..." });
          const lvl = state.hintLevel + 1;

          try {
            // Try contextual hint based on their wrong guess
            let nextHint = await generateContextualHint(
              state.guess,
              state.label,
              state.desc,
              lvl
            );

            // Fallback to standard hint if contextual fails
            if (!nextHint || nextHint.length < 5) {
              nextHint = await generateHintFromAI(
                state.desc,
                lvl,
                [...state.previousHints, state.hint],
                state.label
              );
            }

            dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> " + nextHint });
            analyticsService.trackHintUsed(lvl, state.label);
          } catch (hintErr) {
            console.error("Hint generation error:", hintErr);
            dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Try another guess..." });
          }

          dispatch({ type: GAME_ACTIONS.SET_HINT_LEVEL, payload: lvl });
          dispatch({ type: GAME_ACTIONS.ADD_PREVIOUS_HINT, payload: state.hint });
        }

        console.log("Answer validation result:", {
          guess: state.guess,
          answer: state.label,
          confidence: validation.confidence,
          strategy: validation.strategy,
          score: validation.score,
          reasoning: validation.reasoning,
        });
      }
    } catch (validationErr) {
      console.error("Answer validation error:", validationErr);
      // Fallback to simple matching on error
      dispatch({ type: GAME_ACTIONS.SET_HINT, payload: "> Validation error, try again..." });
    }

    dispatch({ type: GAME_ACTIONS.SET_GUESS, payload: "" });
  }, [state, dispatch]);

  // Memoized handlers
  const handleGuessChange = useCallback((value) => {
    dispatch({ type: GAME_ACTIONS.SET_GUESS, payload: value });
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    loadNewImage();
  }, [loadNewImage]);

  const handleNext = useCallback(() => {
    loadNewImage();
  }, [loadNewImage]);

  const isMobile = useMemo(() => windowSize.width < 768, [windowSize.width]);

  return (
    <div className="app-container">
      <Starfield />

      {/* HEADER */}
      <header className="app-header">
        <ScoreDisplay score={state.score} highScore={state.highScore} />

        <motion.h1
          className="pixel-title"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          PIXELPEEK
        </motion.h1>

        <div className="header-spacer"></div>
      </header>

      {/* MAIN GAME CONTENT */}
      <main className="game-content">
        {/* Desktop Layout */}
        {!isMobile && (
          <div className="game-layout-desktop">
            <div className="game-hint-section">
              <Suspense fallback={<div className="hint-panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "#FFA500" }} aria-hidden="true">LOADING HINT...</div>}>
                <HintPanel hint={state.hint} blurAmount={state.blur} />
              </Suspense>
            </div>

            <div className="game-play-section">
              <div className="game-image-wrapper">
                <Suspense fallback={<div className="game-image-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "#FFA500" }} aria-hidden="true">LOADING IMAGE...</div>}>
                  <GameImageContainer
                    loading={state.loading}
                    imageUrl={state.imageUrl}
                    blur={state.blur}
                    alt="Guess"
                  />
                </Suspense>
              </div>

              <div className="game-controls-wrapper">
                <AttemptsCounter attempts={state.attempts} maxAttempts={MAX_ATTEMPTS} />

                {state.revealed ? (
                  <AnswerReveal label={state.label} onNext={handleNext} />
                ) : (
                  <GuessForm
                    guess={state.guess}
                    onGuessChange={handleGuessChange}
                    onSubmit={handleGuess}
                    onSkip={handleSkip}
                    revealed={state.revealed}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <div className="game-layout-mobile">
            <div className="game-hint-section-mobile">
              <HintPanel hint={state.hint} blurAmount={state.blur} />
            </div>

            <div className="game-image-wrapper-mobile">
              <GameImageContainer
                loading={state.loading}
                imageUrl={state.imageUrl}
                blur={state.blur}
                alt="Guess"
              />
            </div>

            <div className="game-controls-wrapper-mobile">
              <AttemptsCounter attempts={state.attempts} maxAttempts={MAX_ATTEMPTS} />

              {state.revealed ? (
                <AnswerReveal label={state.label} onNext={handleNext} />
              ) : (
                <GuessForm
                  guess={state.guess}
                  onGuessChange={handleGuessChange}
                  onSubmit={handleGuess}
                  onSkip={handleSkip}
                  revealed={state.revealed}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Main App Component with Error Boundary and Context
 */
export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameBoard />
      </GameProvider>
    </ErrorBoundary>
  );
}
