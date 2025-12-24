/**
 * PixelPeek Theme Manager
 * Core theme system logic with localStorage persistence and CSS lazy-loading.
 * 
 * Manages:
 * - Theme persistence (localStorage)
 * - CSS lazy-loading with timeout protection
 * - Font lazy-loading for theme-specific fonts
 * - Starfield canvas attach/detach for retro theme
 * - Change callbacks for reactive UI updates
 * 
 * NO Unsplash API calls during theme switches
 * NO page reloads on theme change
 */

class ThemeManager {
  static STORAGE_KEY = 'pixelpeekTheme';
  static DEFAULT_THEME = 'retro';
  static VALID_THEMES = ['retro', 'minimal', 'scifi'];
  static CSS_TIMEOUT = 5000; // 5 seconds

  /**
   * Initialize theme system
   * Load saved theme or use default
   */
  static init() {
    const savedTheme = this._getSavedTheme();
    this.applyTheme(savedTheme);
    this._preloadOtherThemeCss();
    this._setupFontPreloading();
  }

  /**
   * Apply a theme by name
   * @param {string} themeName - 'retro' | 'minimal' | 'scifi'
   */
  static applyTheme(themeName) {
    // Validate theme
    if (!this.VALID_THEMES.includes(themeName)) {
      console.warn(
        `[ThemeManager] Invalid theme "${themeName}". Valid themes: ${this.VALID_THEMES.join(', ')}`
      );
      themeName = this.DEFAULT_THEME;
    }

    // Save to localStorage
    this._saveTheme(themeName);

    // Apply to DOM
    document.documentElement.setAttribute('data-theme', themeName);

    // Post-apply operations (fonts, starfield, etc)
    this._postApply(themeName);

    // Trigger change callbacks
    this._notifyChange(themeName);
  }

  /**
   * Get currently applied theme
   * @returns {string} Current theme name
   */
  static getTheme() {
    return document.documentElement.getAttribute('data-theme') || this.DEFAULT_THEME;
  }

  /**
   * Reset to default theme
   */
  static reset() {
    this.applyTheme(this.DEFAULT_THEME);
  }

  /**
   * Register theme change callback
   * @param {Function} callback - Called with theme name when changed
   */
  static onThemeChange(callback) {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    this._callbacks.push(callback);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Get saved theme from localStorage
   * @returns {string} Saved theme or default
   * @private
   */
  static _getSavedTheme() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.VALID_THEMES.includes(saved)) {
      return saved;
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Save theme to localStorage
   * @param {string} themeName - Theme to save
   * @private
   */
  static _saveTheme(themeName) {
    try {
      localStorage.setItem(this.STORAGE_KEY, themeName);
    } catch (error) {
      console.warn('[ThemeManager] Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Post-apply theme operations
   * (fonts, starfield canvas, CSS specifics)
   * @param {string} themeName - Applied theme name
   * @private
   */
  static _postApply(themeName) {
    // Load theme CSS
    this._lazyLoadThemeCss(themeName);

    // Load theme-specific fonts
    this._loadThemeFonts(themeName);

    // Handle starfield canvas for retro theme
    this._manageStarfield(themeName);
  }

  /**
   * Lazy-load theme CSS
   * @param {string} themeName - Theme name
   * @private
   */
  static _lazyLoadThemeCss(themeName) {
    // CSS should already be loaded by base.css via @import
    // This method is for dynamic switching or as fallback
    const linkId = `theme-css-${themeName}`;
    
    // Check if already loaded
    if (document.getElementById(linkId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `/src/styles/themes/${themeName}.css`;
    link.onerror = () => {
      console.error(`[ThemeManager] Failed to load theme CSS for "${themeName}"`);
    };

    // Timeout protection
    const timeoutId = setTimeout(() => {
      if (!link.sheet) {
        console.warn(
          `[ThemeManager] Theme CSS "${themeName}" took longer than ${this.CSS_TIMEOUT}ms to load`
        );
      }
    }, this.CSS_TIMEOUT);

    link.onload = () => clearTimeout(timeoutId);

    document.head.appendChild(link);
  }

  /**
   * Load theme-specific fonts
   * @param {string} themeName - Theme name
   * @private
   */
  static _loadThemeFonts(themeName) {
    const fontMap = {
      retro: [
        // Press Start 2P is already in base CSS for all themes
        // Loaded via @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      ],
      minimal: [
        // Inter font
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
      ],
      scifi: [
        // Orbitron font
        'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
      ]
    };

    const fonts = fontMap[themeName] || [];

    fonts.forEach((fontUrl) => {
      // Check if already loaded
      const existingLink = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).find(
        (link) => link.href === fontUrl
      );

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        link.async = true;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Manage starfield canvas for retro theme
   * Attach for retro, detach for others
   * @param {string} themeName - Applied theme name
   * @private
   */
  static _manageStarfield(themeName) {
    const starfieldId = 'starfield-canvas';
    let canvas = document.getElementById(starfieldId);

    if (themeName === 'retro') {
      // Attach starfield for retro theme
      if (!canvas) {
        // Create canvas if it doesn't exist
        canvas = document.createElement('canvas');
        canvas.id = starfieldId;
        canvas.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        // Initialize starfield animation
        this._initStarfield(canvas);
      } else {
        // Show existing canvas
        canvas.style.display = 'block';
      }

      // Ensure app-container is above starfield
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.style.position = 'relative';
        appContainer.style.zIndex = '1';
      }
    } else {
      // Hide or detach starfield for non-retro themes
      if (canvas) {
        canvas.style.display = 'none';
      }

      // Reset z-index
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.style.zIndex = 'auto';
      }
    }
  }

  /**
   * Initialize starfield animation
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @private
   */
  static _initStarfield(canvas) {
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const stars = this._generateStars(200, canvas.width, canvas.height);

    // Animation loop
    const animate = () => {
      // Clear with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(7, 16, 24, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      ctx.fillStyle = '#ffd700';
      stars.forEach((star) => {
        // Update position (move towards bottom)
        star.y += star.speed;

        // Reset to top if off-screen
        if (star.y > canvas.height) {
          star.y = -5;
          star.x = Math.random() * canvas.width;
        }

        // Draw star
        ctx.globalAlpha = star.brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Generate stars for starfield
   * @param {number} count - Number of stars
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @returns {Array} Array of star objects
   * @private
   */
  static _generateStars(count, width, height) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random() * 0.5 + 0.5
      });
    }
    return stars;
  }

  /**
   * Preload other theme CSS files
   * Helps with smooth theme switching
   * @private
   */
  static _preloadOtherThemeCss() {
    this.VALID_THEMES.forEach((themeName) => {
      const linkId = `theme-css-${themeName}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'prefetch';
        link.as = 'style';
        link.href = `/src/styles/themes/${themeName}.css`;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Setup font preloading for all themes
   * @private
   */
  static _setupFontPreloading() {
    const fontUrls = [
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
    ];

    fontUrls.forEach((fontUrl) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'style';
      link.href = fontUrl;
      document.head.appendChild(link);
    });
  }

  /**
   * Notify all change callbacks
   * @param {string} themeName - New theme name
   * @private
   */
  static _notifyChange(themeName) {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    this._callbacks.forEach((callback) => {
      try {
        callback(themeName);
      } catch (error) {
        console.error('[ThemeManager] Callback error:', error);
      }
    });
  }
}

export default ThemeManager;
