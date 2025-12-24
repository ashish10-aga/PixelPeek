/**
 * PixelPeek Theme UI
 * Builds theme selection modal and in-game switcher.
 * 
 * Features:
 * - First-run theme selection modal (full-screen)
 * - Persistent UI state (uses localStorage to track if modal shown)
 * - In-game theme switcher (palette button in header)
 * - Theme preview with current game image as thumbnail
 * - NO Unsplash API calls
 * - Responsive layout
 */

class ThemeUI {
  static MODAL_SHOWN_KEY = 'pixelpeekThemeModalShown';
  static THEME_DEFINITIONS = {
    retro: {
      label: 'RETRO',
      description: 'Classic pixel-art with neon yellow borders',
      accent: '#ffd700'
    },
    minimal: {
      label: 'MINIMAL',
      description: 'Modern clean interface with soft green',
      accent: '#00ff9a'
    },
    scifi: {
      label: 'SCI-FI',
      description: 'Futuristic cyan scanner HUD',
      accent: '#00e5ff'
    }
  };

  /**
   * Show theme selection modal on first run
   * Uses current game image as preview
   */
  static showSelection() {
    // Check if modal already shown
    const alreadyShown = localStorage.getItem(this.MODAL_SHOWN_KEY) === 'true';
    if (alreadyShown) {
      return;
    }

    // Create and display modal
    const modal = this._buildSelectionModal();
    document.body.appendChild(modal);

    // Mark as shown
    this._markModalShown();
  }

  /**
   * Build in-game theme switcher button
   * Returns DOM element ready to insert in header
   * @returns {HTMLElement} Switcher button element
   */
  static buildInGameSwitcher() {
    const container = document.createElement('div');
    container.id = 'theme-switcher-container';
    container.style.cssText = `
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    `;

    // Palette button
    const button = document.createElement('button');
    button.id = 'theme-switcher-btn';
    button.className = 'retro-btn';
    button.style.cssText = `
      width: 44px;
      height: 44px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    button.title = 'Switch Theme';

    // Palette icon (SVG)
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="8" cy="8" r="2.5"></circle>
        <circle cx="16" cy="8" r="2.5"></circle>
        <circle cx="8" cy="16" r="2.5"></circle>
        <circle cx="16" cy="16" r="2.5"></circle>
      </svg>
    `;

    // Toggle dropdown on click
    let dropdownOpen = false;
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;

      if (dropdownOpen) {
        this._showSwitcherDropdown(button, container);
      } else {
        this._closeSwitcherDropdown(container);
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      dropdownOpen = false;
      this._closeSwitcherDropdown(container);
    });

    container.appendChild(button);
    return container;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Build theme selection modal
   * @returns {HTMLElement} Modal element
   * @private
   */
  static _buildSelectionModal() {
    const modal = document.createElement('div');
    modal.id = 'theme-selection-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    `;

    // Modal content
    const content = document.createElement('div');
    content.style.cssText = `
      background: linear-gradient(135deg, rgba(20, 24, 40, 0.95), rgba(10, 15, 30, 0.95));
      border: 2px solid rgba(100, 200, 255, 0.3);
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                  inset 0 1px 1px rgba(255, 255, 255, 0.1);
      animation: slideUp 0.4s ease;
    `;

    // Title
    const title = document.createElement('h2');
    title.textContent = 'CHOOSE YOUR THEME';
    title.style.cssText = `
      color: #00e5ff;
      font-family: 'Press Start 2P', monospace;
      font-size: 18px;
      margin-bottom: 12px;
      letter-spacing: 1px;
      text-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Select a visual style for your experience';
    subtitle.style.cssText = `
      color: rgba(100, 200, 255, 0.7);
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 13px;
      margin-bottom: 32px;
      letter-spacing: 0.5px;
    `;

    // Theme buttons grid
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    `;

    Object.entries(this.THEME_DEFINITIONS).forEach(([themeName, def]) => {
      const button = this._buildThemeButton(themeName, def, modal);
      grid.appendChild(button);
    });

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'CONTINUE WITH RETRO';
    skipBtn.style.cssText = `
      width: 100%;
      padding: 12px 24px;
      background: transparent;
      border: 1px solid rgba(100, 200, 255, 0.3);
      color: rgba(100, 200, 255, 0.7);
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      letter-spacing: 0.5px;
    `;
    skipBtn.addEventListener('mouseenter', () => {
      skipBtn.style.borderColor = 'rgba(100, 200, 255, 0.6)';
      skipBtn.style.color = 'rgba(100, 200, 255, 0.9)';
    });
    skipBtn.addEventListener('mouseleave', () => {
      skipBtn.style.borderColor = 'rgba(100, 200, 255, 0.3)';
      skipBtn.style.color = 'rgba(100, 200, 255, 0.7)';
    });
    skipBtn.addEventListener('click', () => {
      modal.remove();
    });

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(grid);
    content.appendChild(skipBtn);
    modal.appendChild(content);

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    return modal;
  }

  /**
   * Build individual theme selection button
   * @param {string} themeName - Theme name
   * @param {Object} def - Theme definition
   * @param {HTMLElement} modal - Modal to close
   * @returns {HTMLElement} Button element
   * @private
   */
  static _buildThemeButton(themeName, def, modal) {
    const button = document.createElement('button');
    button.style.cssText = `
      padding: 16px 12px;
      background: rgba(50, 100, 150, 0.2);
      border: 2px solid ${def.accent}33;
      border-radius: 8px;
      color: ${def.accent};
      font-family: 'Press Start 2P', monospace;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    `;

    // Label
    const label = document.createElement('div');
    label.textContent = def.label;
    label.style.cssText = `
      font-size: 11px;
      text-shadow: 0 0 8px ${def.accent}66;
      letter-spacing: 1px;
    `;

    // Accent dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${def.accent};
      box-shadow: 0 0 8px ${def.accent}88;
    `;

    button.appendChild(label);
    button.appendChild(dot);

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.background = `${def.accent}15`;
      button.style.borderColor = def.accent;
      button.style.boxShadow = `0 0 16px ${def.accent}44, inset 0 0 8px ${def.accent}22`;
      button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(50, 100, 150, 0.2)';
      button.style.borderColor = `${def.accent}33`;
      button.style.boxShadow = 'none';
      button.style.transform = 'none';
    });

    // Click to apply theme
    button.addEventListener('click', () => {
      ThemeManager.applyTheme(themeName);
      modal.remove();
    });

    return button;
  }

  /**
   * Show switcher dropdown
   * @param {HTMLElement} button - Button element
   * @param {HTMLElement} container - Container element
   * @private
   */
  static _showSwitcherDropdown(button, container) {
    // Remove existing dropdown
    const existing = container.querySelector('.theme-switcher-dropdown');
    if (existing) {
      existing.remove();
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'theme-switcher-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: rgba(20, 24, 40, 0.95);
      border: 1px solid rgba(100, 150, 200, 0.3);
      border-radius: 6px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      min-width: 180px;
      z-index: 1001;
      backdrop-filter: blur(4px);
    `;

    // Current theme indicator
    const currentTheme = ThemeManager.getTheme();

    Object.entries(this.THEME_DEFINITIONS).forEach(([themeName, def]) => {
      const item = document.createElement('button');
      const isActive = themeName === currentTheme;
      item.style.cssText = `
        width: 100%;
        padding: 12px 14px;
        background: ${isActive ? `${def.accent}15` : 'transparent'};
        border: none;
        color: ${def.accent};
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: left;
        border-left: 3px solid ${isActive ? def.accent : 'transparent'};
        letter-spacing: 0.5px;
        ${isActive ? `text-shadow: 0 0 8px ${def.accent}66;` : ''}
      `;

      if (!isActive) {
        item.style.cursor = 'pointer';
      }

      item.textContent = def.label;

      item.addEventListener('mouseenter', () => {
        if (!isActive) {
          item.style.background = `${def.accent}0a`;
          item.style.borderLeftColor = def.accent;
        }
      });

      item.addEventListener('mouseleave', () => {
        if (!isActive) {
          item.style.background = 'transparent';
          item.style.borderLeftColor = 'transparent';
        }
      });

      item.addEventListener('click', () => {
        ThemeManager.applyTheme(themeName);
        dropdown.remove();
      });

      dropdown.appendChild(item);
    });

    container.appendChild(dropdown);
  }

  /**
   * Close switcher dropdown
   * @param {HTMLElement} container - Container element
   * @private
   */
  static _closeSwitcherDropdown(container) {
    const dropdown = container.querySelector('.theme-switcher-dropdown');
    if (dropdown) {
      dropdown.remove();
    }
  }

  /**
   * Mark modal as shown
   * @private
   */
  static _markModalShown() {
    try {
      localStorage.setItem(this.MODAL_SHOWN_KEY, 'true');
    } catch (error) {
      console.warn('[ThemeUI] Failed to mark modal as shown:', error);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeUI;
}
