import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";

// Create the context
const GameContext = createContext(null);
const GameDispatchContext = createContext(null);

// Action types
export const GAME_ACTIONS = {
  SET_IMAGE: "SET_IMAGE",
  SET_LOADING: "SET_LOADING",
  SET_GUESS: "SET_GUESS",
  SET_BLUR: "SET_BLUR",
  SET_HINT: "SET_HINT",
  SET_HINT_LEVEL: "SET_HINT_LEVEL",
  ADD_PREVIOUS_HINT: "ADD_PREVIOUS_HINT",
  INCREMENT_ATTEMPTS: "INCREMENT_ATTEMPTS",
  DECREMENT_SCORE: "DECREMENT_SCORE",
  SET_SCORE: "SET_SCORE",
  REVEAL_ANSWER: "REVEAL_ANSWER",
  SET_HIGH_SCORE: "SET_HIGH_SCORE",
  RESET_GAME: "RESET_GAME",
  SET_LABEL: "SET_LABEL",
  SET_DESC: "SET_DESC",
  SET_PREVIOUS_HINTS: "SET_PREVIOUS_HINTS",
};

// Initial state
const initialState = {
  imageUrl: "",
  desc: "",
  label: "",
  guess: "",
  score: 100,
  attempts: 0,
  revealed: false,
  loading: true,
  blur: 20,
  hint: "Analyzing data...",
  hintLevel: 0,
  previousHints: [],
  highScore: 0,
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.SET_IMAGE:
      return { ...state, imageUrl: action.payload };
    case GAME_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case GAME_ACTIONS.SET_GUESS:
      return { ...state, guess: action.payload };
    case GAME_ACTIONS.SET_BLUR:
      return { ...state, blur: action.payload };
    case GAME_ACTIONS.SET_HINT:
      return { ...state, hint: action.payload };
    case GAME_ACTIONS.SET_HINT_LEVEL:
      return { ...state, hintLevel: Math.min(action.payload, 4) }; // Cap at level 4 (5 total hints)
    case GAME_ACTIONS.ADD_PREVIOUS_HINT:
      return { ...state, previousHints: [...state.previousHints, action.payload] };
    case GAME_ACTIONS.INCREMENT_ATTEMPTS:
      return { ...state, attempts: state.attempts + 1 };
    case GAME_ACTIONS.DECREMENT_SCORE:
      return { ...state, score: Math.max(0, state.score - action.payload) };
    case GAME_ACTIONS.SET_SCORE:
      return { ...state, score: action.payload };
    case GAME_ACTIONS.REVEAL_ANSWER:
      return { ...state, revealed: true, blur: 0 };
    case GAME_ACTIONS.SET_HIGH_SCORE:
      return { ...state, highScore: action.payload };
    case GAME_ACTIONS.SET_LABEL:
      return { ...state, label: action.payload };
    case GAME_ACTIONS.SET_DESC:
      return { ...state, desc: action.payload };
    case GAME_ACTIONS.SET_PREVIOUS_HINTS:
      return { ...state, previousHints: action.payload };
    case GAME_ACTIONS.RESET_GAME:
      return {
        imageUrl: "",
        desc: "",
        label: "",
        guess: "",
        score: 100,
        attempts: 0,
        revealed: false,
        loading: true,
        blur: 20,
        hint: "Analyzing data...",
        hintLevel: 0,
        previousHints: [],
        highScore: state.highScore,
      };
    default:
      return state;
  }
}

// Context Provider Component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load high score from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pixelpeek_highscore");
    if (stored) {
      dispatch({ type: GAME_ACTIONS.SET_HIGH_SCORE, payload: parseInt(stored, 10) });
    }
  }, []);

  // Save high score whenever it changes
  useEffect(() => {
    if (state.highScore > 0) {
      localStorage.setItem("pixelpeek_highscore", String(state.highScore));
    }
  }, [state.highScore]);

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  );
}

// Custom hooks to use context
export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within GameProvider");
  }
  return context;
}

export function useGameDispatch() {
  const context = useContext(GameDispatchContext);
  if (!context) {
    throw new Error("useGameDispatch must be used within GameProvider");
  }
  return context;
}

// Combined hook for convenience
export function useGame() {
  return {
    state: useGameState(),
    dispatch: useGameDispatch(),
  };
}
