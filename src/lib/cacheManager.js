/**
 * CacheManager: LRU + IndexedDB hybrid cache for images and API responses
 */

const DB_NAME = "PixelPeekDB";
const STORE_NAME = "cache";
const MEMORY_CACHE_SIZE = 50; // Max items in memory

class CacheManager {
  constructor() {
    this.memoryCache = new Map(); // LRU memory cache
    this.db = null;
    this.accessOrder = []; // Track access order for LRU
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Get from cache (memory first, then IndexedDB)
   */
  async get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      this.updateAccessOrder(key);
      return this.memoryCache.get(key);
    }

    // Check IndexedDB
    try {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const data = request.result?.value;
          
          // Move to memory cache if found
          if (data) {
            this.setMemory(key, data);
          }
          resolve(data);
        };
      });
    } catch (error) {
      console.warn("IndexedDB get error:", error);
      return null;
    }
  }

  /**
   * Set in cache (both memory and IndexedDB)
   */
  async set(key, value) {
    this.setMemory(key, value);

    try {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.put({ key, value, timestamp: Date.now() });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB set error:", error);
    }
  }

  /**
   * Set in memory cache only (with LRU eviction)
   */
  setMemory(key, value) {
    // Remove if exists to update order
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
    }

    // Add to cache
    this.memoryCache.set(key, value);
    this.updateAccessOrder(key);

    // Evict oldest if over capacity
    if (this.memoryCache.size > MEMORY_CACHE_SIZE) {
      const oldestKey = this.accessOrder.shift();
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Update access order for LRU
   */
  updateAccessOrder(key) {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  /**
   * Clear all caches
   */
  async clear() {
    this.memoryCache.clear();
    this.accessOrder = [];

    try {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn("IndexedDB clear error:", error);
    }
  }

  /**
   * Get cache size
   */
  getSize() {
    return {
      memory: this.memoryCache.size,
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

/**
 * Initialize cache manager (call once on app load)
 */
export async function initializeCache() {
  try {
    await cacheManager.init();
    console.log("Cache manager initialized");
  } catch (error) {
    console.error("Failed to initialize cache:", error);
  }
}
