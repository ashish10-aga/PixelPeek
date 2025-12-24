import { cacheManager } from "./cacheManager";

const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const API_TIMEOUT = 8000; // 8 second timeout

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetch image from Unsplash with caching
 */
export async function fetchImageFromUnsplash(category) {
  const cacheKey = `unsplash_${category}`;

  // Check cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `https://api.unsplash.com/photos/random?query=${category}&w=600&h=600&fit=crop&client_id=${UNSPLASH_API_KEY}`;
    
    const response = await fetchWithTimeout(url);
    const data = await response.json();

    // Validate response
    if (!data?.urls?.regular) {
      throw new Error("Invalid Unsplash response");
    }

    const imageData = {
      imageUrl: data.urls.regular,
      description: data.alt_description || data.description || category,
      tags: (data.tags || []).map((t) => t.title || t),
      photographer: data.user?.name || "Unknown",
      id: data.id,
    };

    // Cache the result
    await cacheManager.set(cacheKey, imageData);

    return imageData;
  } catch (error) {
    console.error("Unsplash API error:", error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

/**
 * Preload multiple images in background
 */
export async function preloadImages(categories, count = 3) {
  const promises = categories.slice(0, count).map((category) =>
    fetchImageFromUnsplash(category).catch((err) => {
      console.warn(`Failed to preload ${category}:`, err);
      return null;
    })
  );

  return Promise.allSettled(promises);
}

/**
 * Fetch cached statistics
 */
export async function getGameStatistics() {
  const cacheKey = "game_stats";
  const cached = await cacheManager.get(cacheKey);

  if (cached) {
    return cached;
  }

  // Return default stats if not cached
  const stats = {
    gamesPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    successRate: 0,
  };

  await cacheManager.set(cacheKey, stats);
  return stats;
}

/**
 * Update game statistics
 */
export async function updateGameStatistics(score, wasCorrect) {
  const stats = await getGameStatistics();

  stats.gamesPlayed += 1;
  stats.totalScore += score;
  stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);

  if (wasCorrect) {
    stats.successRate = Math.round(
      ((stats.successRate * (stats.gamesPlayed - 1) + 100) / stats.gamesPlayed)
    );
  } else {
    stats.successRate = Math.round(
      ((stats.successRate * (stats.gamesPlayed - 1)) / stats.gamesPlayed)
    );
  }

  await cacheManager.set("game_stats", stats);
  return stats;
}

/**
 * Retry logic for failed requests
 */
export async function fetchWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}
