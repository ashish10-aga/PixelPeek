/**
 * PerformanceLogger: Track and log performance metrics
 */

class PerformanceLogger {
  constructor() {
    this.metrics = new Map();
    this.sessionStart = Date.now();
  }

  /**
   * Mark the start of a metric
   */
  startMeasure(name) {
    this.metrics.set(`${name}_start`, performance.now());
  }

  /**
   * End a metric and return the duration
   */
  endMeasure(name) {
    const startTime = this.metrics.get(`${name}_start`);
    if (!startTime) {
      console.warn(`No start marker for metric: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(`${name}_start`);

    if (duration > 100) {
      console.warn(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    } else {
      console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Log a custom metric
   */
  logMetric(name, value) {
    console.log(`[Metric] ${name}: ${value}`);
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Get session duration
   */
  getSessionDuration() {
    return Date.now() - this.sessionStart;
  }
}

/**
 * Analytics Service: Track user interactions and events
 */
class AnalyticsService {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  trackEvent(eventName, eventData = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: eventData,
    };

    this.events.push(event);

    // Log locally for debugging
    console.log(`[Event] ${eventName}`, eventData);

    // Could send to analytics service here
    this.maybeSendToServer();
  }

  /**
   * Track a game score
   */
  trackGameScore(score, correct, hints, category) {
    this.trackEvent("game_completed", {
      score,
      correct,
      hints_used: hints,
      category,
      duration: Date.now() - this.startTime,
    });
  }

  /**
   * Track hint usage
   */
  trackHintUsed(hintLevel, category) {
    this.trackEvent("hint_used", {
      level: hintLevel,
      category,
    });
  }

  /**
   * Track guess attempt
   */
  trackGuessAttempt(guess, correct) {
    this.trackEvent("guess_attempt", {
      guess,
      correct,
    });
  }

  /**
   * Track image load
   */
  trackImageLoad(loadTime, source) {
    this.trackEvent("image_loaded", {
      load_time: loadTime,
      source,
    });
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const gameCompletions = this.events.filter((e) => e.name === "game_completed");
    const totalScore = gameCompletions.reduce((sum, e) => sum + (e.data.score || 0), 0);
    const successRate = gameCompletions.length > 0
      ? Math.round((gameCompletions.filter((e) => e.data.correct).length / gameCompletions.length) * 100)
      : 0;

    return {
      sessionId: this.sessionId,
      gamesPlayed: gameCompletions.length,
      totalScore,
      averageScore: gameCompletions.length > 0 ? Math.round(totalScore / gameCompletions.length) : 0,
      successRate,
      duration: Date.now() - this.startTime,
    };
  }

  /**
   * Send events to server (batch)
   */
  async maybeSendToServer() {
    // Batch every 5 events or periodically
    if (this.events.length % 5 === 0 && this.events.length > 0) {
      this.flushEvents();
    }
  }

  /**
   * Flush all events (send to server)
   */
  async flushEvents() {
    if (this.events.length === 0) return;

    try {
      // Example: Send to your analytics endpoint
      const payload = {
        sessionId: this.sessionId,
        events: this.events,
        timestamp: Date.now(),
      };

      console.log("Would send analytics:", payload);
      
      // Uncomment to send to actual server:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // Clear events after sending
      this.events = [];
    } catch (error) {
      console.error("Failed to send analytics:", error);
    }
  }

  /**
   * Clear events without sending
   */
  clear() {
    this.events = [];
  }
}

// Singleton instances
export const performanceLogger = new PerformanceLogger();
export const analyticsService = new AnalyticsService();

/**
 * Hook-friendly wrapper for performance measurement
 */
export function measurePerformance(fn, name) {
  performanceLogger.startMeasure(name);
  const result = fn();
  performanceLogger.endMeasure(name);
  return result;
}

/**
 * Async version of performance measurement
 */
export async function measurePerformanceAsync(asyncFn, name) {
  performanceLogger.startMeasure(name);
  const result = await asyncFn();
  performanceLogger.endMeasure(name);
  return result;
}
