/**
 * Game Configuration File
 * Centralized configuration for the entire game
 */

export const gameConfig = {
  // Game mechanics
  mechanics: {
    maxAttempts: 5,
    initialBlur: 20,
    blurDecrement: 4,
    initialScore: 100,
    scoreDecrement: 15,
    maxScore: 100,
  },

  // API configuration
  api: {
    unsplash: {
      baseUrl: "https://api.unsplash.com",
      endpoint: "/photos/random",
      timeout: 8000,
      imageWidth: 600,
      imageHeight: 600,
    },
    gemini: {
      baseUrl: "https://generativelanguage.googleapis.com",
      endpoint: "/v1beta/models/gemini-2.0-flash:generateContent",
      timeout: 10000,
    },
  },

  // Cache configuration
  cache: {
    dbName: "PixelPeekDB",
    storeName: "cache",
    memoryCacheSize: 50,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
  },

  // Hint generation
  hints: {
    maxLevels: 4,
    generationTimeout: 10000,
    fallbackHints: [
      "Look closely—something familiar hides within.",
      "Try another guess...",
      "Think about what you see...",
      "Take another look...",
      "Hint generation failed.",
    ],
  },

  // Image categories
  categories: [
    "nature",
    "animals",
    "technology",
    "food",
    "architecture",
    "people",
    "art",
    "sports",
    "travel",
    "abstract",
    "space",
    "cars",
    "flowers",
    "mountains",
    "ocean",
    "forest",
    "city",
    "buildings",
    "sunset",
    "sunrise",
  ],

  // UI configuration
  ui: {
    headerHeight: 80,
    containerPadding: 32,
    mobileBreakpoint: 768,
    animationDuration: 0.3,
    starfieldCount: 200,
  },

  // Analytics
  analytics: {
    enabled: true,
    batchSize: 5,
    batchInterval: 30000, // 30 seconds
    sessionTimeout: 1000 * 60 * 30, // 30 minutes
  },

  // Performance
  performance: {
    enableMetrics: true,
    slowRenderWarning: 16, // ms (one frame at 60fps)
    imagePreloadCount: 3,
    logSlowOperations: true,
  },

  // Feature flags
  features: {
    enableCaching: true,
    enableAnalytics: true,
    enableErrorBoundary: true,
    enableLazyLoading: true,
    enablePreloading: true,
    enableOfflineSupport: true,
  },

  // Difficulty levels (for future expansion)
  difficulty: {
    easy: {
      initialBlur: 10,
      scoreDecrement: 5,
      hintFrequency: "every_attempt",
    },
    normal: {
      initialBlur: 20,
      scoreDecrement: 15,
      hintFrequency: "every_attempt",
    },
    hard: {
      initialBlur: 30,
      scoreDecrement: 25,
      hintFrequency: "every_2_attempts",
    },
  },

  // Error messages
  errors: {
    imageLoadFailed: "Failed to load image. Please try again.",
    hintGenerationFailed: "Could not generate hint. Please try another guess.",
    networkError: "Network error. Please check your connection.",
    unsplashError: "Unable to fetch images. Please try again later.",
    geminiError: "AI hint service temporarily unavailable.",
    cacheError: "Storage error. Some features may not work offline.",
    unknownError: "An unknown error occurred. Please refresh the page.",
  },

  // Success messages
  messages: {
    correct: "Correct!",
    gameover: "Game Over!",
    newHighScore: "New High Score!",
    imageLoading: "Scanning image...",
    hintGenerating: "Generating hint...",
  },

  // Localization (ready for i18n)
  locale: {
    language: "en",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
  },
};

/**
 * Get config value with type checking
 */
export function getConfig(path) {
  const keys = path.split(".");
  let value = gameConfig;

  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Update config value
 */
export function setConfig(path, value) {
  const keys = path.split(".");
  let current = gameConfig;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

export default gameConfig;
