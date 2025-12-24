/**
 * Constants and utilities for PixelPeek game
 */

export const GAME_CONSTANTS = {
  MAX_ATTEMPTS: 5,
  INITIAL_BLUR: 20,
  BLUR_DECREMENT: 4,
  INITIAL_SCORE: 100,
  SCORE_DECREMENT: 15,
  API_TIMEOUT: 8000,
  HINT_GENERATION_TIMEOUT: 10000,
  MAX_MEMORY_CACHE_SIZE: 50,
  CATEGORIES: [
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
  ],
};

/**
 * String utilities
 */
export const stringUtils = {
  /**
   * Normalize string for comparison
   */
  normalize: (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .trim(),

  /**
   * Check if guess matches label
   */
  isMatch: (guess, label) => {
    const g = stringUtils.normalize(guess);
    const l = stringUtils.normalize(label);
    return g === l || g.includes(l) || l.includes(g);
  },

  /**
   * Truncate string to length
   */
  truncate: (str, length = 50) => {
    if (!str) return "";
    return str.length > length ? str.slice(0, length) + "..." : str;
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};

/**
 * Number utilities
 */
export const numberUtils = {
  /**
   * Format number with comma separators
   */
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  /**
   * Clamp number between min and max
   */
  clamp: (num, min = 0, max = 100) => {
    return Math.max(min, Math.min(max, num));
  },

  /**
   * Round to decimal places
   */
  round: (num, decimals = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Get percentage
   */
  percentage: (current, max) => {
    return max === 0 ? 0 : Math.round((current / max) * 100);
  },
};

/**
 * Time utilities
 */
export const timeUtils = {
  /**
   * Format milliseconds to readable time
   */
  formatTime: (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  },

  /**
   * Debounce timing utility
   */
  debounce: (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Throttle timing utility
   */
  throttle: (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        fn(...args);
        lastCall = now;
      }
    };
  },
};

/**
 * Array utilities
 */
export const arrayUtils = {
  /**
   * Shuffle array
   */
  shuffle: (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Get random item from array
   */
  random: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Remove duplicates
   */
  unique: (arr) => {
    return [...new Set(arr)];
  },

  /**
   * Chunk array into groups
   */
  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
};

/**
 * Object utilities
 */
export const objectUtils = {
  /**
   * Deep clone object
   */
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Merge objects
   */
  merge: (...objects) => {
    return Object.assign({}, ...objects);
  },

  /**
   * Get nested property
   */
  getNestedProperty: (obj, path) => {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  },

  /**
   * Check if object is empty
   */
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate email
   */
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL
   */
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if string is empty
   */
  isEmpty: (str) => {
    return !str || str.trim().length === 0;
  },

  /**
   * Validate score
   */
  isValidScore: (score) => {
    return typeof score === "number" && score >= 0 && score <= 100;
  },
};

/**
 * DOM utilities
 */
export const domUtils = {
  /**
   * Check if element is in viewport
   */
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  },

  /**
   * Smooth scroll to element
   */
  smoothScrollTo: (element) => {
    element?.scrollIntoView?.({ behavior: "smooth" });
  },

  /**
   * Get scroll position
   */
  getScrollPosition: () => {
    return {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };
  },

  /**
   * Prevent body scroll
   */
  preventScroll: () => {
    document.body.style.overflow = "hidden";
  },

  /**
   * Restore body scroll
   */
  restoreScroll: () => {
    document.body.style.overflow = "";
  },
};

/**
 * Storage utilities
 */
export const storageUtils = {
  /**
   * Safe JSON parse
   */
  safeParse: (json, fallback = null) => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },

  /**
   * Safe JSON stringify
   */
  safeStringify: (obj, fallback = "{}") => {
    try {
      return JSON.stringify(obj);
    } catch {
      return fallback;
    }
  },

  /**
   * Get from session storage
   */
  getSession: (key) => {
    const value = sessionStorage.getItem(key);
    return storageUtils.safeParse(value);
  },

  /**
   * Set to session storage
   */
  setSession: (key, value) => {
    sessionStorage.setItem(key, storageUtils.safeStringify(value));
  },

  /**
   * Get from local storage
   */
  getLocal: (key) => {
    const value = localStorage.getItem(key);
    return storageUtils.safeParse(value);
  },

  /**
   * Set to local storage
   */
  setLocal: (key, value) => {
    localStorage.setItem(key, storageUtils.safeStringify(value));
  },
};
